'use strict'

$(function() {

  $('.companyForm').submit(getCompanies);
  $('.quoteForm').submit(getQuote);
  $('div.quotes').on('click', 'button.del', deleteQuote );
  renderQuotes();

});

function getCompanies() {
  event.preventDefault();
  var inputText = $('#inputText').val();

//  console.log('inputText: ', inputText);
  $('div.companies').empty();

  var url = 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=' + inputText + '&callback=?';
  $.getJSON(url).done(function(data) {
//companyObjs is an array of JSON objects
    var companyObjs = data;
//    console.log(   'companyObjs: ',  companyObjs  );
    var $companyCards = companyObjs.map(makeCompanyCard);
    $('div.companies').append($companyCards);

  })
  .fail(function(err) {
    console.log( 'err:', err );
  })
};

function makeCompanyCard(companyObj) {

  var $card = $('<div>').addClass('card');
  var $Symbol = $('<p>').text(`Symbol: ${companyObj.Symbol}`);
  var $Name = $('<p>').text(`Name: ${companyObj.Name}`);
  var $Exchange = $('<p>').text(`Exchange: ${companyObj.Exchange}`);

  $card.append($Symbol, $Name, $Exchange);

  return $card;
}


function getQuote() {
 event.preventDefault();
 var symbol = $('#symbolText').val();

  var url = `http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=${symbol}&callback=?`;
  $.getJSON(url).done(function(data) {
    var quote = data;

    if(quote.Symbol == symbol.toUpperCase()) {
      var $quote = makeQuoteCard(data);
      $('div.quotes').append($quote);
    }

    //add quotes to local storage
    if(quote.Symbol == symbol.toUpperCase()) {
      var quotes = QuoteStorage.get();
      quotes.push(quote);
      QuoteStorage.write(quotes);
    }

  })
  .fail(function(err) {
    console.log( 'err:', err );
  });
}

function renderQuotes() {
  var quotes = QuoteStorage.get();

  var $quoteCards = quotes.map(makeQuoteCard);
  // append all quotes to the DOM
  $('div.quotes').append($quoteCards);

}

function makeQuoteCard(quote) {
  var $card = $('<div>').addClass('card');
  var $button = $('<button>').addClass('del').text('Stop Tracking');
  var change = quote.ChangeYTD;

  var $Symbol = $('<p>').text(`Symbol: ${quote.Symbol}`);
  var $Name = $('<p>').text(`Name: ${quote.Name}`);
  var $High = $('<p>').text(`Daily High: ${quote.High}`);
  var $Low = $('<p>').text(`Daily Low: ${quote.Low}`);
  var $LastPrice = $('<p>').text(`Last Price: ${quote.LastPrice}`);
  var $ChangeYTD = $('<p>').text(`ChangeYTD: ${change}`);

  if(change >= 0) {
    $ChangeYTD.addClass('green');
    console.log( '$ChangeYTD: ' , $ChangeYTD );
  } else {
    $ChangeYTD.addClass('red');
    console.log( '$ChangeYTD: ' , $ChangeYTD );

  }

  $card.append($Symbol, $Name, $High, $Low, $LastPrice, $ChangeYTD, $button);

  return $card;
}

function deleteQuote(event) {
  var index = $(this).closest('div.card').index();
  var quotes = QuoteStorage.get();
  quotes.splice(index, 1);
  QuoteStorage.write(quotes);

  $(this).closest('div.card').remove();

}

var QuoteStorage = {
  get: function() {
    try {
      var quotes = JSON.parse(localStorage.quotes);
    } catch(err) {
      var quotes = [];
    }
    return quotes;
  },
  write: function(quotes) {
    localStorage.quotes = JSON.stringify(quotes);
  }
};
