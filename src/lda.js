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

export default function (opts) {
  opts = opts || {}
  const random = Seed(opts.random)
  this.configure = function (docs, v, iterations, burnIn, thinInterval, sampleLag) {
    this.ITERATIONS = iterations
    this.BURN_IN = burnIn
    this.THIN_INTERVAL = thinInterval
    this.SAMPLE_LAG = sampleLag
    this.documents = docs
    this.V = v
    this.dispcol = 0
    this.numstats = 0
  }
  this.initialState = function (K) {
    let i
    const M = this.documents.length
    this.nw = make2DArray(this.V, K)
    this.nd = make2DArray(M, K)
    this.nwsum = makeArray(K)
    this.ndsum = makeArray(M)
    this.z = []
    for (i = 0; i < M; i++) {
      this.z[i] = []
    }
    for (let m = 0; m < M; m++) {
      const N = this.documents[m].length
      this.z[m] = []
      for (let n = 0; n < N; n++) {
        const topic = parseInt('' + (random() * K))
        this.z[m][n] = topic
        this.nw[this.documents[m][n]][topic]++
        this.nd[m][topic]++
        this.nwsum[topic]++
      }
      this.ndsum[m] = N
    }
  }

  this.gibbs = function (K, alpha, beta) {
    let i
    this.K = K
    this.alpha = alpha
    this.beta = beta
    if (this.SAMPLE_LAG > 0) {
      this.thetasum = make2DArray(this.documents.length, this.K)
      this.phisum = make2DArray(this.K, this.V)
      this.numstats = 0
    }
    this.initialState(K)
    // document.write("Sampling " + this.ITERATIONS
    //   + " iterations with burn-in of " + this.BURN_IN + " (B/S="
    //   + this.THIN_INTERVAL + ").<br/>");
    for (i = 0; i < this.ITERATIONS; i++) {
      for (let m = 0; m < this.z.length; m++) {
        for (let n = 0; n < this.z[m].length; n++) {
          const topic = this.sampleFullConditional(m, n)
          this.z[m][n] = topic
        }
      }
      if ((i < this.BURN_IN) && (i % this.THIN_INTERVAL === 0)) {
        // document.write("B");
        this.dispcol++
      }
      if ((i > this.BURN_IN) && (i % this.THIN_INTERVAL === 0)) {
        // document.write("S");
        this.dispcol++
      }
      if ((i > this.BURN_IN) && (this.SAMPLE_LAG > 0) && (i % this.SAMPLE_LAG === 0)) {
        this.updateParams()
        // document.write("|");
        if (i % this.THIN_INTERVAL !== 0) { this.dispcol++ }
      }
      if (this.dispcol >= 100) {
        // document.write("*<br/>");
        this.dispcol = 0
      }
    }
  }

  this.sampleFullConditional = function (m, n) {
    let topic = this.z[m][n]
    this.nw[this.documents[m][n]][topic]--
    this.nd[m][topic]--
    this.nwsum[topic]--
    this.ndsum[m]--
    const p = makeArray(this.K)
    for (let k = 0; k < this.K; k++) {
      p[k] = (this.nw[this.documents[m][n]][k] + this.beta) / (this.nwsum[k] + this.V * this.beta) *
                  (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha)
    }
    for (let k = 1; k < p.length; k++) {
      p[k] += p[k - 1]
    }
    const u = random() * p[this.K - 1]
    for (topic = 0; topic < p.length; topic++) {
      if (u < p[topic]) { break }
    }
    this.nw[this.documents[m][n]][topic]++
    this.nd[m][topic]++
    this.nwsum[topic]++
    this.ndsum[m]++
    return topic
  }

  this.updateParams = function () {
    for (let m = 0; m < this.documents.length; m++) {
      for (let k = 0; k < this.K; k++) {
        this.thetasum[m][k] += (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha)
      }
    }
    for (let k = 0; k < this.K; k++) {
      for (let w = 0; w < this.V; w++) {
        this.phisum[k][w] += (this.nw[w][k] + this.beta) / (this.nwsum[k] + this.V * this.beta)
      }
    }
    this.numstats++
  }

  this.getTheta = function () {
    const theta = []; for (let i = 0; i < this.documents.length; i++) theta[i] = []
    if (this.SAMPLE_LAG > 0) {
      for (let m = 0; m < this.documents.length; m++) {
        for (let k = 0; k < this.K; k++) {
          theta[m][k] = this.thetasum[m][k] / this.numstats
        }
      }
    } else {
      for (let m = 0; m < this.documents.length; m++) {
        for (let k = 0; k < this.K; k++) {
          theta[m][k] = (this.nd[m][k] + this.alpha) / (this.ndsum[m] + this.K * this.alpha)
        }
      }
    }
    return theta
  }

  this.getPhi = function () {
    const phi = []; for (let i = 0; i < this.K; i++) phi[i] = []
    if (this.SAMPLE_LAG > 0) {
      for (let k = 0; k < this.K; k++) {
        for (let w = 0; w < this.V; w++) {
          phi[k][w] = this.phisum[k][w] / this.numstats
        }
      }
    } else {
      for (let k = 0; k < this.K; k++) {
        for (let w = 0; w < this.V; w++) {
          phi[k][w] = (this.nw[w][k] + this.beta) / (this.nwsum[k] + this.V * this.beta)
        }
      }
    }
    return phi
  }
}
