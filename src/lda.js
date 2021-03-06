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
    const progress = opts.progress
    const random = Seed(opts.seed)
    let dispcol = 0
    let nw, nd, nwsum, ndsum, z
    let thetasum, phisum, numstats

    /**
     * Initialisation: Must start with an assignment of observations to topics ?
     * Many alternatives are possible, I chose to perform random assignments
     * with equal probabilities
     *
     * @param K
     *            number of topics
     * @return z assignment of topics to words
     */
    const initialState = function (K) {
      let i
      const M = documents.length
      nw = make2DArray(V, K)
      nd = make2DArray(M, K)
      nwsum = makeArray(K)
      ndsum = makeArray(M)

      // The z_i are are initialised to values in [1,K] to determine the
      // initial state of the Markov chain.
      z = []
      for (i = 0; i < M; i++) {
        z[i] = []
      }
      for (let m = 0; m < M; m++) {
        const N = documents[m].length
        z[m] = []
        for (let n = 0; n < N; n++) {
          const topic = parseInt(random() * K)
          z[m][n] = topic
          nw[documents[m][n]][topic]++
          nd[m][topic]++
          nwsum[topic]++
        }
        ndsum[m] = N
      }
    }

    /**
     * Sample a topic z_i from the full conditional distribution: p(z_i = j |
     * z_-i, w) = (n_-i,j(w_i) + beta)/(n_-i,j(.) + W * beta) * (n_-i,j(d_i) +
     * alpha)/(n_-i,.(d_i) + K * alpha)
     *
     * @param m
     *            document
     * @param n
     *            word
     */
    const sampleFullConditional = function (m, n) {
      // remove z_i from the count variables
      let topic = z[m][n]
      nw[documents[m][n]][topic]--
      nd[m][topic]--
      nwsum[topic]--
      ndsum[m]--

      // do multinomial sampling via cumulative method:
      const p = makeArray(self.K)
      for (let k = 0; k < self.K; k++) {
        p[k] = (nw[documents[m][n]][k] + self.beta) / (nwsum[k] + V * self.beta) *
          (nd[m][k] + self.alpha) / (ndsum[m] + self.K * self.alpha)
      }

      // cumulate multinomial parameters
      for (let k = 1; k < p.length; k++) {
        p[k] += p[k - 1]
      }

      // scaled sample because of unnormalised p[]
      const u = random() * p[self.K - 1]
      for (topic = 0; topic < p.length; topic++) {
        if (u < p[topic]) {
          break
        }
      }

      // add newly estimated z_i to count variables
      nw[documents[m][n]][topic]++
      nd[m][topic]++
      nwsum[topic]++
      ndsum[m]++
      return topic
    }

    /**
     * Add to the statistics the values of theta and phi for the current state.
     */
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

    /**
     * Configure the gibbs sampler
     *
     * @param iterations
     *            number of total iterations
     * @param burnIn
     *            number of burn-in iterations
     * @param thinInterval
     *            update statistics interval
     * @param sampleLag
     *            sample interval (-1 for just one sample at the end)
     */
    self.gibbs = async function (K, alpha, beta) {
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
          if (progress) {
            await progress(i)
          }
        }
      }
    }

    /**
     * Retrieve estimated document--topic associations. If sample lag > 0 then
     * the mean value of all sampled statistics for theta[][] is taken.
     *
     * @return theta multinomial mixture of document topics (M x K)
     */
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

    /**
     * Retrieve estimated topic--word associations. If sample lag > 0 then the
     * mean value of all sampled statistics for phi[][] is taken.
     *
     * @return phi multinomial mixture of topic words (K x V)
     */
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

export default async function (k, documents, words, opts) {
  opts = Object.assign({
    iterations: 10000,
    burnIn: 2000,
    thinInterval: 100,
    sampleLag: 10,
    alpha: 2,
    beta: 0.5
  }, opts)
  const lda = new LDA(documents, words.length, {
    seed: opts.seed,
    progress: opts.progress
  })

  lda.configure(opts.iterations, opts.burnIn, opts.thinInterval, opts.sampleLag)
  await lda.gibbs(k, opts.alpha, opts.beta)
  return {
    theta: lda.getTheta(),
    phi: lda.getPhi()
  }
}
