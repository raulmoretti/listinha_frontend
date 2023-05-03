# Listinha frontend
## _A lista online de supermercado da sua família_

Este projeto é uma app frontend do projeto _https://github.com/raulmoretti/listinha_backend_

# Execução

ATENÇÃO: _Deve ser utilizado o navegador Mozilla Firefox para sua execução. O fato é que o projeto backend foi feito utilizando o framework django, e com a app django-cors-headers, que é responsável por permitir requests de qualquer origem e não somente da origem do projeto. A configuração do django-cors-headers que habilita pedidos de qualquer origem (CORS_ALLOW_ALL_ORIGINS = True) não é suportado por navegadores chromium.
Entretanto, a execução desta aplicação configurada como uma app do projeto django, onde, feito um endpoint no arquivo urls.py para o app frontend, adicionando o nome do app na settings.py, e criando-se uma views.py para executar somente o arquivo html inicial (de forma que use a mesma origem do backend http://localhost:8000/), permite a execução em navegadores chromium._

##### Para a execução desta aplicação deve-se primeiro, iniciar o servidor do listinha_backend, copiar e colar o endereço (do sistema operacional) do arquivo index.html na url do navegador.




[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
