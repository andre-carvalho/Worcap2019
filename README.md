# Worcap2019
[Minicurso](http://www.inpe.br/worcap/2019/minicursos.php) - Tecnologias Web para dashboards dinâmicos - explorando APIs TerraBrasilis para dados de desmatamento.

## É praticamente impossível imaginar qualquer painel sem gráficos e tabelas. Eles apresentam estatísticas complexas de maneira rápida e eficaz. Além disso, um bom gráfico também aprimora o design geral do seu site.


# Gráficos interativos

## Permite alterar a perspectiva de análise filtrando as dimensões do dado diretamente nos gráficos.

# Tecnologias para gráficos na Web

- [Google charts](https://developers.google.com/chart/)
- [D3.js](https://d3js.org/) e derivados como: [C3](https://c3js.org/), [DC](https://dc-js.github.io/dc.js/), 
    > https://github.com/d3/d3/wiki/gallery
- [chartjs](https://www.chartjs.org/)
- [Highcharts](https://www.highcharts.com/)
- [18+](https://www.sitepoint.com/best-javascript-charting-libraries/)

- [D3 X Google charts](https://humansofdata.atlan.com/2014/09/d3-js-versus-google-charts/)

# DCjs - uma escolha

## Bom conjunto de componentes, integração com D3 + Crossfilter.

- [DCjs](https://dc-js.github.io/dc.js/) + [Crossfilter](http://crossfilter.github.io/crossfilter/)

[Componentes](http://dc-js.github.io/dc.js/docs/html/) e [exemplos de uso](https://dc-js.github.io/dc.js/examples/).

https://www.tutorialspoint.com/dcjs/dcjs_dashboard_working_example.htm

# E os dados?

## Dados dos programas de monitoramento da Amazônia e demais biomas, PRODES e DETER

## Onde estão os dados? TerraBrasilis
## Como obtê-los? via APIs ou Download direto dos dados em formato Shapefile, CSV...

# Tecnologias para serviços de dados

- [GeoServer](http://geoserver.org/)
- APIs sob medida usando Python, NodeJS, ...
- [TerraBrasilis Analytics API](http://terrabrasilis.dpi.inpe.br/dashboard/api/v1/redis-cli/)

## Exemplo de consumo de dados

- [GeoServiços](http://terrabrasilis.dpi.inpe.br/geoserver/wms?service=WMS&request=GetCapabilities&version=1.3.0)
    > [Arquivos pré gerados](http://terrabrasilis.dpi.inpe.br/download/deter-amz/deter_month_d.json)


# Transformando os dados em informações

## Linguagens para Web:

- HTML
- CSS
- JavaScript


## Ferramentas e ambiente de desenvolvimento

- Visual Studio Code ou outro editor de texto
- Postman
- DevTools - Painel de inspeção de códigos no navegador

## Painéis gráficos

### Dashboards TerraBrasilis

- [v0](https://andre-carvalho.github.io/PRODESdashboard/prodes-rates.html)
- [v1](http://terrabrasilis.dpi.inpe.br/app/dashboard/alerts/legal/amazon/aggregated/)
- [v2 -  homologação](http://terrabrasilis.dpi.inpe.br/homologation/dashboard/alerts/legal/amazon/aggregated/)


## Construindo um dashboard simples

- A estrutura básica de uma página
    > HTML + JS + CSS
- Incluindo as bibliotecas de gráficos
- Lendo os dados
- Normalizando os dados
- Registrando as dimensões do dado no CrossFilter
- Criando os componentes gráficos - consultar a [documentação](https://dc-js.github.io/dc.js/docs/html/index.html) oficial para customizações.
- Atribuindo as dimensões do dado às dimensões do gráfico
- Finalmente desenhando
- Labels, Legendas, ...
