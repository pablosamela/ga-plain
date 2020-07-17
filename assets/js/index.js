const Config = {
  domain: 'http://localhost:3000/',
  amountOfRetries: 2,
  backOffDelay: 300,
  statusCodes: [408, 500, 502, 503, 504, 522, 524],
  messages:{
    success: {
      text: 'Congrats! You\’re officially subscribed to Giving Assistant!',
      class: 'text-success'
    },
    error: {
      text: 'Ups, something went wrong!',
      class: 'text-error'
    }
  }
};


const Newsletter = (($, Config) => {
  'use strict';

  const _newsletterFrom = $('#newsletterFrom');
  const _emailControl = $('#emailControl');
  const _emailButton = $('#emailButton');
  const _messageResponse = $('#messageResponse');
  let _validator = null; 

  const _validateForm = () => {
    _validator = _newsletterFrom.validate({
      onkeyup: false, 
      validClass: Config.messages.success.class,
      errorClass: Config.messages.error.class
    });
  };

  const _send = (event) => {
    event.preventDefault();
    if(_newsletterFrom.valid()){
      var url = Config.domain + 'api/subscription';
      _messageResponse.removeClass();
      _subscribeToNewsletter(url, Config.amountOfRetries, Config.backOffDelay);
    }
  };

  const _subscribeToNewsletter = (url, amountOfRetries, backOffDelay) => {
    const parameters = new URLSearchParams('email='+ _emailControl.val());
    const options = { 
      method: 'POST',
      body: 'email='+ encodeURIComponent(_emailControl.val()),
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    };

    return fetch(url, options)
      .then(response => {
        if (response.ok){
          _messageResponse.show().addClass(Config.messages.success.class).text(Config.messages.success.text);
          return true;
        } 
      
        if (amountOfRetries > 0 && Config.statusCodes.includes(response.status)) {
          setTimeout(() => {
            return _subscribeToNewsletter(url, amountOfRetries - 1, backOffDelay * 2);
          }, backOffDelay)
        } else {
          _messageResponse.show().addClass(Config.messages.error.class).text(Config.messages.error.text);
          return false;
        }
      })
      .catch(console.error);
  };

  const clearForm = () =>{
    _messageResponse.hide();
    _emailControl.val('');
    if(_validator){
      _validator.resetForm();
    }
  };

  const init = () => {
    _validateForm();
    _emailButton.click(_send);
  };

  return {
    init: init,
    clearForm: clearForm
  }
})(jQuery, Config);

const Coupons = (($) => {
  'use strict';
  const _cuponCodeButton = $('#cuponCodeButton');
  const _cuponCodeControl = $('#cuponCodeControl');

  const _copyToClipboard = (event) => {
    event.preventDefault();
    _cuponCodeControl.select();
    document.execCommand("copy");
    _cuponCodeButton.removeClass('btn-primary').addClass('btn-success').text('Code copied');
  };
  
  const init = () => {
    _cuponCodeButton.on('click', _copyToClipboard);
  };

  return {
    init: init
  }
})(jQuery);

const App = ((Extensions) => {
  'use strict';
  const init = () => {
    Extensions.coupons.init();
    Extensions.newsletter.init();

    $('#gaModal').on('hidden.bs.modal', function (e) {
      Extensions.newsletter.clearForm();
    });

  };

  return {
    init: init
  }
})({
  coupons: Coupons || {}, 
  newsletter: Newsletter || {}
});

App.init();
