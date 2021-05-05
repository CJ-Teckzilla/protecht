(function(w,d,c,n,s,p){
      w[n] = w[n] || function () { (w[n].q = w[n].q || []).push(arguments) }, w[n].l = +new Date();
      s = d.createElement(c), p = d.getElementsByTagName(c)[0];
      s.async = s.src = 'https://icw.protecht.io/client-widget.min.js';
      p.parentNode.insertBefore(s, p);
    })(window,document,'script','tg');
tg('configure', {
    apiKey: 'pk_sandbox_c24dc55e4d07719b80c0916ce8a28e4dbf6a048f',
    locale: 'en_US',
    currency: 'USD',
    costsOfItems: ["1"],
    sandbox: true,
    loadedCb: function() {
        console.log('update callback');
    },
    optInCb: function() {
        var quoteToken = tg.get("token");
        console.log('opted in callback');
    },
    optOutCb: function() {
        var quoteToken = tg.get("token");
        console.log('opted out callback');
    },
    onErrorCb: function(object){
        console.log(object);
    }
});
