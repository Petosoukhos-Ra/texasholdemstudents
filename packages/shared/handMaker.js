function makeHand(origCards) {
    const cardsByRank = [...origCards]
    cardsByRank.sort(byRank)
    //TODO : all other kind of hands
    //Exemple:
    // if (isPair()) {
    //     return makePair(cardsByRank)
    // }
    return makeSingleCard(cardsByRank)
}

function makeSingleCard(cardsByRank) {
    const hand = {}
    hand.type = 'high'
    hand.rank = cardsByRank[0].rank
    hand.kickers = cardsByRank.filter((c) => c.rank !== hand.rank)
    return hand
}

function byRank(c1, c2) {
    if (c1.rank === 1 && c2.rank === 1) {
        return 0
    }
    if (c1.rank === 1 && c2.rank > 1) {
        return 1
    }
    if (c2.rank === 1 && c1.rank > 1) {
        return -1
    }
    return c2.rank - c1.rank
}

function isQuad(counts) {
    // parcours des valeurs dans l'objet counts
    for (let value in counts) {
      // si une valeur est présente quatre fois, c'est un carré
      if (counts[value] === 4) {
        return true;
      }
    }
    // aucune valeur n'a été trouvée quatre fois
    return false;
  }

  function isFullHouse(counts) {
    let foundThreeOfAKind = false;
    let foundPair = false;
  
    // parcours des valeurs dans l'objet counts
    for (let value in counts) {
      // si une valeur est présente trois fois, c'est un brelan
      if (counts[value] === 3) {
        foundThreeOfAKind = true;
      }
      // si une valeur est présente deux fois, c'est une paire
      if (counts[value] === 2) {
        foundPair = true;
      }
    }
    // un full se compose d'un brelan et d'une paire
    return foundThreeOfAKind && foundPair;
  }

  function isThreeOfAKind(counts) {
    // parcours des valeurs dans l'objet counts
    for (let value in counts) {
      // si une valeur est présente trois fois, c'est un brelan
      if (counts[value] === 3) {
        return true;
      }
    }
    // aucune valeur n'a été trouvée trois fois
    return false;
  }

  function isDoublePair(counts) {
    let foundPairs = 0;
  
    // parcours des valeurs dans l'objet counts
    for (let value in counts) {
      // si une valeur est présente deux fois, c'est une paire
      if (counts[value] === 2) {
        foundPairs++;
      }
    }
    // un double paire se compose de deux paires
    return foundPairs === 2;
  }

  function isPair(counts) {
    // parcours des valeurs dans l'objet counts
    for (let value in counts) {
      // si une valeur est présente deux fois, c'est une paire
      if (counts[value] === 2) {
        return true;
      }
    }
    // aucune valeur n'a été trouvée deux fois
    return false;
  }

export { makeHand,byRank}