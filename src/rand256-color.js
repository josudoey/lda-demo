const Seed = require('seed-random')
const color256 = require('./color256')
const indexes = []
for (let i = 0; i < 256; i++) {
  indexes.push(i)
}

const random = Seed('seed')
for (let i = 0; i < 256; i++) {
  const j = parseInt(random() * 256)
  const tmp = indexes[i]
  indexes[i] = indexes[j]
  indexes[j] = tmp
}

module.exports = indexes.map((i) => color256[i])
