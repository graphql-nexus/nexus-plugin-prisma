/**
 * Given an invalid input string and a list of valid options, returns a filtered
 * list of valid options sorted based on their similarity with the input.
 */
export function suggestionList(input: string = '', options: string[] = []): string[] {
  var optionsByDistance = Object.create(null)
  var oLength = options.length
  var inputThreshold = input.length / 2

  for (var i = 0; i < oLength; i++) {
    var distance = lexicalDistance(input, options[i])
    var threshold = Math.max(inputThreshold, options[i].length / 2, 1)

    if (distance <= threshold) {
      optionsByDistance[options[i]] = distance
    }
  }

  return Object.keys(optionsByDistance).sort(function (a, b) {
    return optionsByDistance[a] - optionsByDistance[b]
  })
}
/**
 * Computes the lexical distance between strings A and B.
 *
 * The "distance" between two strings is given by counting the minimum number
 * of edits needed to transform string A into string B. An edit can be an
 * insertion, deletion, or substitution of a single character, or a swap of two
 * adjacent characters.
 *
 * Includes a custom alteration from Damerau-Levenshtein to treat case changes
 * as a single edit which helps identify mis-cased values with an edit distance
 * of 1.
 *
 * This distance can be useful for detecting typos in input or sorting
 */
function lexicalDistance(aStr: string, bStr: string): number {
  if (aStr === bStr) {
    return 0
  }

  let i: number
  let j: number
  const d: number[][] = []
  const a = aStr.toLowerCase()
  const b = bStr.toLowerCase()
  const aLength = a.length
  const bLength = b.length // Any case change counts as a single edit

  if (a === b) {
    return 1
  }

  for (i = 0; i <= aLength; i++) {
    d[i] = [i]
  }

  for (j = 1; j <= bLength; j++) {
    d[0][j] = j
  }

  for (i = 1; i <= aLength; i++) {
    for (j = 1; j <= bLength; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost)
      }
    }
  }

  return d[aLength][bLength]
}
