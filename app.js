const collectorApp = angular.module('collectorApp', []);

collectorApp.controller('CardsController', ['$scope', '$timeout', '$http' , function CardsController($scope, $timeout, $http) {

  let localCards;
  let localCardsIds;
  if (localStorage.cards) localCards = JSON.parse(localStorage.cards);
  if (localCards) localCardsIds = localCards.map( c => c.card );

  $scope.filters = {
    'owned': false,
    'missing': false,
    'duplicates': false
  }

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
    if ($scope.cancelClick) {
      $scope.cancelClick = false;
      $scope.clicked = false;
      return;
    }
    if (!card.active) card.toggleCard();
    save();
    $scope.cancelClick = false;
    $scope.clicked = false;
    $scope.animatedCard = 0;
  }

  function jsonCards() {
    let sCards = [];
    let cards = getAllCards();
    for (let i in cards) {
      if (cards[i].owned) {
        let card = { card: cards[i].id, duplicates: cards[i].duplicates }
        if (card.duplicates == 0) delete card.duplicates;
        sCards.push(card);
      }
    }
    return { cards: sCards, user: localStorage.user }
  }

  $scope.saveCards = () => {
    let url = "https://nacho-api.herokuapp.com//api/save-cards";
    let data = jsonCards();
    var request = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data)
    }
    $http(request).then(function(r){
      try {
        let user = r.data.user;
        localStorage.setItem('user', user)
        if (user.includes('userId:')) $scope.noUser = true;
        save();
        saveAlert('success');
      } catch(e) {
        saveAlert('error');
      }
    }, function(e){
      saveAlert('error')
    });
  }

  function saveAlert(type) {
    swal({
      type: type,
      showConfirmButton: false,
      position: 'bottom-right',
      width: '100px',
      backdrop: false,
      background: '#F5EED5',
      timer: 1000
    });
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
    save();
  }
  $scope.gaveDuplicate = (card) => {
    if (card.duplicates > 0) card.decrementDuplicate();
    save();
  }

  $scope.toggleTools = () => {
    $scope.tActive = !$scope.tActive;
  }

  $scope.tFilter = false;

  $scope.toggleFilter = () => {
    $scope.tFilter = !$scope.tFilter;
  }

  $scope.cardFilter = (type) => {
    $scope.filters[type] = !$scope.filters[type];
    if (type == 'duplicates' && $scope.filters.duplicates) {
      let cards = getAllCards();
      cards.map( c => c.active = true)
    } else {
      let cards = getAllCards();
      cards.map( c => c.active = false)
    }
  }

  $scope.showCard = (card) => {
    let show = true;
    let filtersKeys = Object.keys($scope.filters).map( (k,v) => $scope.filters[k] );
    if (filtersKeys.some( fk => fk)) {
      if ($scope.filters.owned) show = card.owned;
      if ($scope.filters.missing) show = !card.owned;
      if ($scope.filters.duplicates) show = card.duplicates > 0;
    }
    return show;
  }

  $scope.showGroup = (cards) => {
    return cards.some( card => $scope.showCard(card) );
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

  function getAllCards() {
    let cards = [];
    for (let i in $scope.groups) {
      let groupCards = $scope.groups[i].groupCards();
      groupCards.map( c => cards.push(c));
    }
    return cards;
  }

  function save() {
    let cards = jsonCards().cards;
    localStorage.setItem('cards', JSON.stringify(cards));
  }

  function apply(){
    if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != 'digest') $scope.$apply();
  }

}]);

collectorApp.directive('dblClickMobile', function () {

  const DblClickInterval = 300; //milliseconds

  var firstClickTime;
  var waitingSecondClick = false;

  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.bind('click', function (e) {

        if (!waitingSecondClick) {
          firstClickTime = (new Date()).getTime();
          waitingSecondClick = true;

          setTimeout(function () {
            waitingSecondClick = false;
          }, DblClickInterval);
        }
        else {
          waitingSecondClick = false;

          var time = (new Date()).getTime();
          if (time - firstClickTime < DblClickInterval) {
            scope.$apply(attrs.dblClickMobile);
          }
        }
      });
    }
  };
});
