const collectorApp = angular.module('collectorApp', []);

collectorApp.controller('CardsController', ['$scope', '$timeout' , function CardsController($scope, $timeout) {

  let localCards;
  let localCardsIds;
  if (localStorage.groups) localCards = JSON.parse(localStorage.groups);
  if (localCards) localCardsIds = localCards.map( c => c.card );

  class Card {

    constructor(id) {
      this.id = id;
      this.owned = false;
      this.active
      this.duplicates = 0;
    }

    toggleCard() {
      this.owned = !this.owned;
      return this.owned
    }

    toggleActive() {
      this.active = !this.active;
      return this.active
    }

    incrementDuplicate() {
      this.duplicates += 1;
    }

    decrementDuplicate() {
      this.duplicates -= 1;
    }

  }

  class CardGroup {

    constructor(name, page, group, init, end) {
      this.name = name;
      this.page = page;
      this.group = group || null;
      this.cards = [];
      this.generateCards(init,end);
    }

    forJSON() {
      this.cards.map( (card) => {
        return { id: card.id, duplicates: card.duplicates };
      } )
    }

    generateCards(init,end) {
      for (let i = init; i <= end; i++) {
        let id = this.name == 'Coca Cola' ? `CC${i}` : i;
        let card = new Card(id);
        if (localCards && localCardsIds && localCardsIds.includes(id)) {
          let lCard = localCards[localCardsIds.indexOf(id)];
          card.owned = true;
          if (lCard.duplicates) card.duplicates = lCard.duplicates
        }
        this.cards.push(card);
      }
    }

    groupCards() {
      return this.cards;
    }

  }

  let groupLetter = 'ABCDEFGH';

  let cardsGroups  = [
    { name: 'Inicio', page: 1, init: 1, end: 6 },
    { name: 'Estadios', page: 2, init: 8, end: 19 },
    { name: 'Ciudades', page: 4, init: 20, end: 31 },
    { name: 'Coca Cola', page: 54, init: 1, end: 9},
    { name: 'Legends', page: 78, init: 672, end: 681}
  ];

  let countries = [
   'Rusia', 'Arabia Saudita', 'Egipto', 'Uruguay',
   'Portugal', 'España', 'Marruecos', 'Irán',
   'Francia', 'Australia', 'Perú', 'Dinamarca',
   'Argentina', 'Islandia', 'Croacia', 'Nigeria',
   'Brasil', 'Suiza', 'Costa Rica', 'Serbia',
   'Alemania', 'México', 'Suecia', 'Corea',
   'Bélgica', 'Panamá', 'Túnez', 'Inglaterra',
   'Polonia', 'Senegal', 'Colombia', 'Japón'
  ];

  fillCountries(countries);

  function fillCountries(countries) {
    let page = 10;
    let init = 32;
    let end = 51;
    for (let i in countries) {
      let country = countries[i];
      let group = groupLetter[parseInt(i / 4)];
      let fCountry = { name: country, group: group, page: page, init: init, end: end };
      cardsGroups.push(fCountry);
      page += 2;
      init += 20;
      end += 20;
      if (country == 'México') page += 2;
    }
  }

  let orderedGroups = cardsGroups.sort( (a, b) => a.page - b.page );
  $scope.groups = fillGroups(orderedGroups);

  function fillGroups (pages) {
    let groups = [];
    for (let i in pages) {
      let page = pages[i];
      let group = new CardGroup(page.name, page.page, page.group, page.init, page.end)
      groups.push(group)
    }
    return groups;
  }

  $scope.toggleCard = (card) => {
    if(card.owned) $scope.animatedCard = card.id
    if ($scope.clicked) {
      $scope.cancelClick = true;
      return;
    }
    $scope.clicked = true;
    $timeout( () => {
      if ($scope.cancelClick) {
        $scope.cancelClick = false;
        $scope.clicked = false;
        return;
      }
      if (!card.active) card.toggleCard();
      $scope.cancelClick = false;
      $scope.clicked = false;
      $scope.animatedCard = 0;
    }, 500);
  }

  $scope.saveCards = () => {
    let sCards = [];
    for (let i in $scope.groups) {
      let cards = $scope.groups[i].groupCards();
      for (let i in cards) {
        if (cards[i].owned) {
          let card = { card: cards[i].id, duplicates: cards[i].duplicates }
          if (card.duplicates == 0) delete card.duplicates;
          sCards.push(card);
        }
      }
    }
    localStorage.setItem('groups', JSON.stringify(sCards));
  }

  $scope.showDups = (card) => {
    if (card.owned) card.toggleActive();
  }

  $scope.showAllDups = (group) => {
    let cards = group.groupCards();
    for (let i in cards) {
      $scope.showDups(cards[i]);
    }
  }

  $scope.gotDuplicate = (card) => {
    card.incrementDuplicate();
  }
  $scope.gaveDuplicate = (card) => {
    card.decrementDuplicate();
  }

  $scope.toggleTools = () => {
    $scope.tActive = !$scope.tActive;
  }

  $scope.getOwnedCount = () => {
    let groupCards = $scope.groups.map( g => g.groupCards() );
    let cards = groupCards.reduce((r, a) => [...r, ...a], [] );
    return cards.filter( c => c.owned).length;
  }

  $scope.getMissingCount = () => {
    let groupCards = $scope.groups.map( g => g.groupCards() );
    let cards = groupCards.reduce((r, a) => [...r, ...a], [] );
    return 690 - cards.filter( c => c.owned).length;
  }

  $scope.getDuplicateCount = () => {
    let groupCards = $scope.groups.map( g => g.groupCards() );
    if (groupCards.length > 0) {
      let cards = groupCards.reduce((r, a) => [...r, ...a], [] );
      let duplicates = cards.filter( c => c.duplicates ).map( d => d.duplicates );
      if (duplicates.length > 0) {
        let reduced = duplicates.reduce( ( base, element ) => base + element );
        return reduced;
      }
    }
    return 0;
  }

  function apply(){
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != 'digest') $scope.$apply();
  }

}]);
