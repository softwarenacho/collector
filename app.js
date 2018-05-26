const collectorApp = angular.module('collectorApp', []);

collectorApp.controller('CardsController', ['$scope', '$timeout', '$http' , function CardsController($scope, $timeout, $http) {

  class Card {

    constructor(id) {
      this.id = id;
      this.owned = false;
      this.active;
      this.duplicates = 0;
    }

    toggleCard() {
      this.owned = !this.owned;
      return this.owned;
    }

    toggleActive() {
      this.active = !this.active;
      return this.active;
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
        if ($scope.localCardsIds && $scope.localCardsIds.length > 0) {
          if ($scope.localCards && $scope.localCardsIds.includes(id)) {
            card.owned = true;
            let lCards = typeof($scope.localCards) == 'string' ? JSON.parse( $scope.localCards ) : $scope.localCards;
            let duplicates = lCards.find( c => c.card == id ).duplicates;
            if (duplicates) card.duplicates = duplicates;
          }
        }
        this.cards.push(card);
      }
    }

    groupCards() {
      return this.cards;
    }

  }

  let enviroment = window.location.href;
  let urlBase = enviroment.includes('softwarenacho') ? 'https://nacho-api.herokuapp.com/api/' : 'http://localhost:3000/api/';
  $scope.local = localStorage;

  if (localStorage.cards && localStorage.cards.length > 0) $scope.localCards = JSON.parse(localStorage.cards);
  if ($scope.localCards && $scope.localCards.length > 0) $scope.localCardsIds = $scope.localCards.map( c => c.card );


  $scope.init = () => {
    $scope.user = { name: localStorage.user, pin: '', pinConfirm: ''};
    $scope.showUserBox = false;
    $scope.filters = {
      'owned': false,
      'missing': false,
      'duplicates': false
    }
    let cardsGroups  = fillCards();
    $scope.groups = fillGroups(cardsGroups);
  }

  function fillCards() {
    let cardsGroups  = [
      { name: 'Inicio', page: 1, init: 1, end: 7 },
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
    let groupLetter = 'ABCDEFGH';
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
    return cardsGroups.sort( (a, b) => a.page - b.page );
  }

  function fillGroups (pages) {
    let groups = [];
    for (let i in pages) {
      let page = pages[i];
      let group = new CardGroup(page.name, page.page, page.group, page.init, page.end);
      groups.push(group);
    }
    return groups;
  }

  $scope.toggleCard = (card) => {
    if(card.owned) $scope.animatedCard = card.id;
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
    let jCards = [];
    let cards = getAllCards();
    for (let i in cards) {
      if (cards[i].owned) {
        let card = { card: cards[i].id, duplicates: cards[i].duplicates }
        if (card.duplicates == 0) delete card.duplicates;
        jCards.push(card);
      }
    }
    return {
      card: {
        cards: jCards,
        user: localStorage.user
      }
    }
  }

  function stringifyCards() {
    if (localStorage.cards) {
      let cards = JSON.parse(localStorage.cards);
      let sCards = cards.map( (x) => {
        let c = `${x.card}`;
        c += x.duplicates > 0 ? '|' + x.duplicates : '';
        if (cards.slice(-1)[0] != x) c += ','
        return c;
      });
      return sCards.join('');
    }
  }

  $scope.saveCards = () => {
    let url = "save-cards";

    let cardsString = stringifyCards();
    let user = $scope.user.name || localStorage.user;
    let data = { card: { cards: cardsString } };
    if (user) data.card.user = user;
    var request = {
      method: 'POST',
      url: urlBase + url,
      headers: {
        'Content-Type':'application/json'
      },
      data: JSON.stringify(data)
    }
    $http(request).then(function(r){
      try {
        if (r.data.error) {
          saveAlert('error', 'bottom-right');
        } else {
          let user = r.data.user;
          localStorage.setItem('user', user);
          $scope.user.name = user;
          save();
          if (!r.data.pin) {
            $scope.tActive = true;
            $scope.showUserBox = true;
            $scope.askPin = true;
            $scope.fromSave = true;
          }
          saveAlert('success', 'bottom-right');
        }
      } catch(e) {
        saveAlert('error', 'bottom-right');
      }
    }, function(e){
      saveAlert('error', 'bottom-right')
    });
  }

  function saveAlert(type, position) {
    swal({
      type: type,
      showConfirmButton: false,
      position: position,
      width: '100px',
      backdrop: false,
      background: '#F5EED5',
      timer: 1000
    });
  }

  function saveUserDB() {
    let url = "save-user";
    let data = { card: {
      name: $scope.user.name,
      password: $scope.user.pin,
      user: localStorage.user
    }};
    var request = {
      method: 'PUT',
      url: urlBase + url,
      headers: { 'Content-Type':'application/json' },
      data: JSON.stringify(data)
    }
    $http(request).then(function(r){
      try {
        let user = r.data.user;
        if (user) {
          localStorage.setItem('user', user);
          $scope.tActive = false;
          $scope.showUserBox = false;
          saveAlert('success', 'bottom-left');
        } else {
          saveAlert('error', 'bottom-left');
        }
      } catch(e) {
        saveAlert('error', 'bottom-left');
      }
    }, function(e){
      saveAlert('error', 'bottom-left')
    });
  }

  $scope.saveUser = () => {
    if ( $scope.user.name && $scope.user.pin ) {
     saveUserDB();
    } else {
      if (!$scope.user.name) $scope.loginError = 'card';
      if (!$scope.user.pin) $scope.loginError = 'pin';
    }
  }

  // Probado y funcionando
  function savePinDB() {
    let url = "save-pin";
    let data = { password: $scope.user.pin, name: $scope.user.name, user: localStorage.user };
    var request = {
      method: 'PUT',
      url: urlBase + url,
      headers: { 'Content-Type':'application/json' },
      data: JSON.stringify(data)
    }
    $http(request).then(function(r){
      try {
        if (r.data.code == 0) {
          $scope.tActive = false;
          $scope.askPin = false;
          $scope.showUserBox = false;
          $scope.fromSave = false;
          $scope.user.pin = '';
          $scope.user.pinConfirm = '';
          delete $scope.loginError;
          localStorage.user = $scope.user.name;
          saveAlert('success', 'bottom-left');
        } else {
          $scope.loginError = { error: r.data.error }
          saveAlert('error', 'bottom-left');
        }
      } catch(e) {
        saveAlert('error', 'bottom-left');
      }
    }, function(e){
      saveAlert('error', 'bottom-left')
    });
  }

  // Probado y funcionando
  $scope.saveUserPin = () => {
    savePinDB();
  }

  $scope.toggleLogIn = () => {
    $scope.showLogIn = true;
    $scope.showUserBox = true;
  }

  $scope.register = () => {
    let url = "register-collector";
    let cardsString = stringifyCards();
    let data = { user: $scope.user.name, password: $scope.user.pin, cards: cardsString };
    let request = {
      method: 'POST',
      url: urlBase + url,
      headers: { 'Content-Type':'application/json' },
      data: JSON.stringify(data)
    }
    $http(request).then(function(r){
      try {
        if (r.data.code == 0) {
          localStorage.user = $scope.user.name;
          $scope.showLogIn = false;
          $scope.showUserBox = false;
          $scope.tActive = false;
          delete $scope.loginError;
          $scope.user = { name: localStorage.user, pin: '', pinConfirm: ''};
          saveAlert('success', 'bottom-left');
        } else {
          saveAlert('error', 'bottom-left');
        }
      } catch(e) {
        saveAlert('error', 'bottom-left');
      }
    }, function(e){
      saveAlert('error', 'bottom-left')
    });
  }

  $scope.logIn = () => {
    let url = "login-collector";
    let data = { user: $scope.user.name, password: $scope.user.pin };
    let request = {
      method: 'POST',
      url: urlBase + url,
      headers: { 'Content-Type':'application/json' },
      data: JSON.stringify(data)
    }
    $http(request).then(function(r){
      try {
        if (r.data.code == 0) {
          localStorage.user = $scope.user.name;
          $scope.fillCards(r.data.card.cards);
          $scope.failedLogIn = false;
          $scope.showLogIn = false;
          $scope.showUserBox = false;
          $scope.tActive = false;
          delete $scope.loginError;
          $scope.user = { name: localStorage.user, pin: '', pinConfirm: ''};
          saveAlert('success', 'bottom-left');
          $scope.init()
        } else {
          if (r.data.error == 'card') {
            $scope.showRegister = true;
          }
          $scope.loginError  = r.data.error
          $scope.failedLogIn = true;
          saveAlert('error', 'bottom-left');
        }
      } catch(e) {
        $scope.failedLogIn = true;
        saveAlert('error', 'bottom-left');
      }
    }, function(e){
      $scope.failedLogIn = true;
      saveAlert('error', 'bottom-left')
    });
  }

  $scope.showRegisterBox = () => {
    $scope.showRegisterBox = true;
    $scope.showRegister = true;
  }

  $scope.disableRegister = () => {
    $scope.showRegister = false;
    $scope.showRegisterBox = false;
  }

  $scope.fillCards = (cardsString) => {
    let cards = formatCloudCards(cardsString);
    localStorage.setItem('cards', JSON.stringify(cards));
    $scope.localCards = localStorage.cards;
    $scope.localCardsIds = cards.map( c => c.card );
  }

  function formatCloudCards(cardString) {
    let cards = cardString.split(',');
    return cards.map( (c) => {
      let id = c.split('|')[0];
      let duplicates = c.split('|')[1];
      let object = { card: parseInt(id) }
      if (duplicates) object.duplicates = parseInt(duplicates);
      return object
    } );
  }

  $scope.logOut = () => {
    $scope.user = { name: '', pin: '', pinConfirm: ''};
    localStorage.removeItem('user');
    $scope.showUserBox = false;
    $scope.tActive = false;
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

  $scope.toggleUser = () => {
    $scope.showUserBox = !$scope.showUserBox;
    if (!$scope.showUserBox) {
      $scope.editUser = false;
      $scope.askPin = false;
      $scope.showLogIn = false;
      $scope.showRegisterBox = false;
      $scope.showRegister = false;
      $scope.fromSave = false;
    }
    $scope.tActive = true;
  }

  $scope.editUser = false;
  $scope.toggleEditUser = () => {
    $scope.editUser = !$scope.editUser;
  }

  $scope.toggleTools = () => {
    $scope.tActive = !$scope.tActive;
  }

  $scope.tFilter = false;

  $scope.toggleFilter = () => {
    $scope.tActive = true;
    $scope.tFilter = !$scope.tFilter;
  }

  $scope.cardFilter = type => {
    Object.keys($scope.filters).map( f => {
      $scope.filters[f] = f == type && !$scope.filters[f];
    });
    if (type == 'duplicates' && $scope.filters.duplicates) {
      let cards = getAllCards();
      cards.map( c => c.active = true)
    } else {
      let cards = getAllCards();
      cards.map( c => c.active = false)
    }
  }

  $scope.fActive = () => {
    return $scope.filters.owned || $scope.filters.duplicates || $scope.filters.missing;
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
    let cards = jsonCards().card.cards;
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
