import Seed from 'seed-random'
function makeArray (x) {
  const a = []
  for (let i = 0; i < x; i++) {
    a[i] = 0
  }
  return a
}

function make2DArray (x, y) {
  const a = []
  for (let i = 0; i < x; i++) {
    a[i] = []
    for (let j = 0; j < y; j++) { a[i][j] = 0 }
  }
  return a
}

class LDA {
  constructor (documents, V, opts) {
    const self = this
    opts = Object.assign({
      seed: 'random'
    }, opts)
    const random = Seed(opts.seed)
    let dispcol = 0
    let nw, nd, nwsum, ndsum, z
    let thetasum, phisum, numstats

    const initialState = function (K) {
      let i
      const M = documents.length
      nw = make2DArray(V, K)
      nd = make2DArray(M, K)
      nwsum = makeArray(K)
      ndsum = makeArray(M)
      z = []
      for (i = 0; i < M; i++) {
        z[i] = []
      }
      for (let m = 0; m < M; m++) {
        const N = documents[m].length
        z[m] = []
        for (let n = 0; n < N; n++) {
          const topic = parseInt('' + (random() * K))
          z[m][n] = topic
          nw[documents[m][n]][topic]++
          nd[m][topic]++
          nwsum[topic]++
        }
        ndsum[m] = N
      }
    }

    const sampleFullConditional = function (m, n) {
      let topic = z[m][n]
      nw[documents[m][n]][topic]--
      nd[m][topic]--
      nwsum[topic]--
      ndsum[m]--
      const p = makeArray(self.K)
      for (let k = 0; k < self.K; k++) {
        p[k] = (nw[documents[m][n]][k] + self.beta) / (nwsum[k] + V * self.beta) *
          (nd[m][k] + self.alpha) / (ndsum[m] + self.K * self.alpha)
      }
      for (let k = 1; k < p.length; k++) {
        p[k] += p[k - 1]
      }
      const u = random() * p[self.K - 1]
      for (topic = 0; topic < p.length; topic++) {
        if (u < p[topic]) {
          break
        }
      }
      nw[documents[m][n]][topic]++
      nd[m][topic]++
      nwsum[topic]++
      ndsum[m]++
      return topic
    }

    const updateParams = function () {
      for (let m = 0; m < documents.length; m++) {
        for (let k = 0; k < self.K; k++) {
          thetasum[m][k] += (nd[m][k] + self.alpha) / (ndsum[m] + self.K * self.alpha)
        }
      }
      for (let k = 0; k < self.K; k++) {
        for (let w = 0; w < V; w++) {
          phisum[k][w] += (nw[w][k] + self.beta) / (nwsum[k] + V * self.beta)
        }
      }
      numstats++
    }

    self.configure = function (iterations, burnIn, thinInterval, sampleLag) {
      self.ITERATIONS = iterations
      self.BURN_IN = burnIn
      self.THIN_INTERVAL = thinInterval
      self.SAMPLE_LAG = sampleLag
    }

    self.gibbs = function (K, alpha, beta) {
      self.K = K
      self.alpha = alpha
      self.beta = beta
      if (self.SAMPLE_LAG > 0) {
        thetasum = make2DArray(documents.length, self.K)
        phisum = make2DArray(self.K, V)
        numstats = 0
      }
      initialState(K)
      for (let i = 0; i < self.ITERATIONS; i++) {
        for (let m = 0; m < z.length; m++) {
          for (let n = 0; n < z[m].length; n++) {
            const topic = sampleFullConditional(m, n)
            z[m][n] = topic
          }
        }
        if ((i < self.BURN_IN) && (i % self.THIN_INTERVAL === 0)) {
          dispcol++
        }
        if ((i > self.BURN_IN) && (i % self.THIN_INTERVAL === 0)) {
          dispcol++
        }
        if ((i > self.BURN_IN) && (self.SAMPLE_LAG > 0) && (i % self.SAMPLE_LAG === 0)) {
          updateParams()
          if (i % self.THIN_INTERVAL !== 0) { dispcol++ }
        }
        if (dispcol >= 100) {
          dispcol = 0
        }
      }
    }

    self.getTheta = function () {
      const theta = []; for (let i = 0; i < documents.length; i++) { theta[i] = [] }
      if (self.SAMPLE_LAG > 0) {
        for (let m = 0; m < documents.length; m++) {
          for (let k = 0; k < self.K; k++) {
            theta[m][k] = thetasum[m][k] / numstats
          }
        }
      } else {
        for (let m = 0; m < documents.length; m++) {
          for (let k = 0; k < self.K; k++) {
            theta[m][k] = (nd[m][k] + self.alpha) / (ndsum[m] + self.K * self.alpha)
          }
        }
      }
      return theta
    }

    self.getPhi = function () {
      const phi = []; for (let i = 0; i < self.K; i++) { phi[i] = [] }
      if (self.SAMPLE_LAG > 0) {
        for (let k = 0; k < self.K; k++) {
          for (let w = 0; w < V; w++) {
            phi[k][w] = phisum[k][w] / numstats
          }
        }
      } else {
        for (let k = 0; k < self.K; k++) {
          for (let w = 0; w < V; w++) {
            phi[k][w] = (nw[w][k] + self.beta) / (nwsum[k] + V * self.beta)
          }
        }
      }
      return phi
    }
  }
}

export default function (k, documents, words, opts) {
  opts = Object.assign({
    iterations: 10000,
    burnIn: 2000,
    thinInterval: 100,
    sampleLag: 10,
    alpha: 2,
    beta: 0.5
  }, opts)
  const lda = new LDA(documents, words.length, {
    seed: opts.seed
  })

  lda.configure(opts.iterations, opts.burnIn, opts.thinInterval, opts.sampleLag)
  lda.gibbs(k, opts.alpha, opts.beta)
  return {
    theta: lda.getTheta(),
    phi: lda.getPhi()
  }
}
