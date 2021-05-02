import Console from "../../consolevp";

import * as Utils from "./utils";

const STORE = {
    coin: "BRL",
    locale: "pt-BR"
};

export function parseProduct (local, currentPrice = 0, product, period, seePointsWithoutRepetition) {
    return {
        ...product,
        ...parseProductInformations(local, product, currentPrice, period, seePointsWithoutRepetition)
    };
}

function productInformationsByPeriod (local, historic, currentPrice, period, seePointsWithoutRepetition, priceNotCaptured = false) {

    if (!currentPrice) throw new Error("Desculpe, não conseguimos capturar o preço desse produto <br> no momento. Um membro da nossa equipe está trabalhando para corrigir esse problema.");
    if (!Utils.validateIfPeriodHasMinimumQuantityForCalculation(historic, 2)) throw new Error("Desculpe, não temos dados suficientes. <br> Ainda precisamos de mais dados para informar se o preço está bom. Continue de olho!");

    const historyForAPeriod = Utils.getPriceHistoryForAPeriod(historic, period);

    const historicGroupByDate = Utils.priceHistoryWelBelowPercent(historyForAPeriod, currentPrice, 80);

    let historicGraph = [];

    if (local == "internal") {
        const historicWithouCurrentDate = Utils.ignoreCurrentDate(historicGroupByDate);

        const historicWithCurrentDate = priceNotCaptured ? historicWithouCurrentDate : Utils.addCurrentDateInHistory(currentPrice, historicWithouCurrentDate);

        historicGraph = historicWithCurrentDate;
    } else if (local == "popup") {
        const lastHistoric = historic.length ? historic[historic.length - 1] : null;

        const historicWithoutDateCaptured = lastHistoric ? Utils.ignoreDate(historicGroupByDate, lastHistoric.datetime) : historicGroupByDate;

        const historicWithCurrentDate = Utils.addLastDateInHistory(lastHistoric, historicWithoutDateCaptured);

        historicGraph = historicWithCurrentDate;
    }

    if (!Utils.validateIfPeriodHasMinimumQuantityForCalculation(historicGraph) && period !== "3days") throw new Error(`Desculpe, não temos dados suficientes. <br>Não conseguimos avaliar o preço ${Utils.formatPeriod(period).toLowerCase()}!`);

    let {
        minPrice,
        maxPrice,
        minDate
    } = Utils.getMinMax(
        historicGraph,
        currentPrice
    );
    const average = Utils.getAverage(historicGraph);
    const percentage = Utils.getPercent(currentPrice, average);

    const status = Utils.selectPriceStatus(percentage, true);

    let obj = {
        status,
        percentage,
        average,
        minPrice,
        maxPrice,
        currentPrice,
        minDate,
        isToGroup: true,
        period
    };

    Console(`Calculo baseado no agrupamento ${JSON.stringify(obj, null, 4)}`);

    if (seePointsWithoutRepetition) {
        const historicWithouRepeatedPoints = [];

        for (let index = 0; index < historicGraph.length; index++) {
            const point = historicGraph[index];

            const lastHistoric = historicWithouRepeatedPoints[historicWithouRepeatedPoints.length - 1] || {};

            if (lastHistoric.value !== point.value) {
                historicWithouRepeatedPoints.push(point);
            } else if ((historicGraph.length -1) === index) {
                historicWithouRepeatedPoints.push(point);
            }


        }
        if (historicWithouRepeatedPoints.length > 2) {
            obj.historicGraph = historicWithouRepeatedPoints;
            
        } else {
            obj.historicGraph = historicGraph;
        }
        Console(`Quantidade de pontos sem valores repetidos ${historicWithouRepeatedPoints.length} e com valores repetidos ${historicGraph.length}`);
    } else {
        obj.historicGraph = historicGraph;
    }


    return obj;

}

export function selectMessageAndColorBaseByStatus (status, period = "90days") {
    let backgroundColor, statusTitle, statusLegend;
    let colors = getColorsByStatusAndWhitelabel(process.env.WHITELABEL_TOKEN);
    switch (status) {
        case "lowestprice":
            backgroundColor = colors.lowestprice;
            statusTitle = "O preço tá bom para caramba!";
            statusLegend = "Se quiser, a hora é agora.";

            break;

        case "belowaverage":
            backgroundColor = colors.belowaverage;
            statusTitle = "Tá bem bacana o preço!";
            statusLegend = "Agora é com você.";

            break;
        case "reasonableprice":
            backgroundColor = colors.reasonableprice;
            statusTitle = "O preço está legalzinho!";
            statusLegend = `Analisando ${Utils.formatPeriod(period).toLowerCase()} até vale a pena, mas se ainda estiver com duvida, crie um alerta.`;
            break;

        case "expensive":
            backgroundColor = colors.expensive;
            statusTitle = "Não tá ruim, mas dá pra melhorar!";
            statusLegend = `Analisando ${Utils.formatPeriod(period).toLowerCase()} achamos melhor ficar de olho! Se estiver precisando compre mas o preço pode melhorar.`;
            break;

        case "veryexpensive":
            backgroundColor = colors.veryexpensive;
            statusTitle = "Putz! Ta ficando caro esse produto!";
            statusLegend = `Analisando ${Utils.formatPeriod(period).toLowerCase()} talvez seja melhor esperar. Crie um alerta de preço.`;
            break;

        case "moreexpensive":
            backgroundColor = colors.moreexpensive;
            statusTitle = "Ta caro D+";
            statusLegend = "Melhor criar um alerta ou pesquisar mais.";
            break;

        case "noopinion":
            backgroundColor = colors.noopinion;
            statusTitle = "";
            statusLegend = "Você está visualizando todos os dados coletados. Para visualizar os status desligue o botão: Ver todas as variações.";
            break;

        case "pricenotcaptured":
            backgroundColor = colors.pricenotcaptured;
            statusTitle = "";
            statusLegend = "Não conseguimos capturar o preço neste dia. Você está vendo dados referente ao último valor capturado";
            break;

    }
    return {
        backgroundColor,
        statusTitle,
        statusLegend
    };
}
// ["belowaverage", "lowestprice"]

export function selectMessageSharedByStatusAndNetwork (status, network, link, query) {
    let linkShared = `${link}${link.includes("?") ? "&" : "?"}${query}`;
    switch (network) {
        case "twitter":
            switch (status) {
                case "lowestprice":
                    return `O preço está bom para caramba! Não perca tempo, aproveite essa Super Oferta que encontrei usando o ${process.env.TWITTER_USER} ${linkShared}`;
                case "belowaverage":
                    return `Tá bem bacana o preço! Não perca tempo, aproveite essa Super Oferta que encontrei usando o  ${process.env.TWITTER_USER} ${linkShared}`;
                default:
                    return `Aproveite essa oferta que encontrei usando o  ${process.env.TWITTER_USER} ${linkShared}`;
            }
        case "facebook":
            switch (status) {
                case "lowestprice":
                    return `O preço está bom para caramba! Não perca tempo, aproveite essa Super Oferta que encontrei usando o  ${process.env.PROJECT_TITLE}`;
                case "belowaverage":
                    return `Tá bem bacana o preço! Não perca tempo, aproveite essa Super Oferta que encontrei usando o  ${process.env.PROJECT_TITLE}`;
                default:
                    return `Aproveite essa oferta que encontrei usando o  ${process.env.PROJECT_TITLE}`;
            }
        case "whatsapp":
            switch (status) {
                case "lowestprice":
                    return `O preço está bom para caramba! Não perca tempo, aproveite essa Super Oferta que encontrei usando o  ${process.env.PROJECT_TITLE} ${linkShared}`;
                case "belowaverage":
                    return `Tá bem bacana o preço! Não perca tempo, aproveite essa Super Oferta que encontrei usando o  ${process.env.PROJECT_TITLE} ${linkShared}`;
                default:
                    return `Aproveite essa oferta que encontrei usando o  ${process.env.PROJECT_TITLE} ${linkShared}`;
            }
        default:
            break;
    }
}



function selectLegendBaseByStatus (status, minPrice, minDate, average, period) {
    if (notHasLegendBaseByStatus(status)) return;

    return `o produto chegou a custar <b>${minPrice.toLocaleString(STORE.locale, { style: "currency", currency: STORE.coin })}</b> em ${new Date(minDate).toLocaleDateString("pt-BR")} com a média nesse período de <b>${average.toLocaleString(STORE.locale, { style: "currency", currency: STORE.coin })}</b>`;
}

function notHasLegendBaseByStatus (status) {
    return status == "lowestprice" || status == "noopinion" || status == "pricenotcaptured";
}

export function parseProductInformations (local, {
    historic,
    unavailable,
    price
}, currentPrice = 0, period = "90days", seePointsWithoutRepetition) {
    let priceNotCaptured = false;
    try {
        if (unavailable) {
            throw new Error("Desculpe, esse produto neste momento encontra-se indisponível nesta loja.");

        }


        let avgPrices = Utils.getPercent(price, currentPrice);
        avgPrices = avgPrices < 0 ? avgPrices * -1 : avgPrices;
        if (avgPrices >= 80) {
            priceNotCaptured = true;
        }

        let {
            status,
            percentage,
            average,
            minPrice,
            maxPrice,
            historicGraph,
            minDate
        } = productInformationsByPeriod(local, historic, priceNotCaptured ? price : currentPrice, period, seePointsWithoutRepetition, priceNotCaptured);

        status = priceNotCaptured ? "pricenotcaptured" : status;
        const {
            backgroundColor,
            statusTitle,
            statusLegend
        } = selectMessageAndColorBaseByStatus(status, period);

        const statusMessage = selectLegendBaseByStatus(status, minPrice, minDate, average, period);

        return {
            status,
            backgroundColor,
            statusMessage,
            statusTitle,
            statusLegend,
            price: priceNotCaptured ? price : currentPrice,
            hasHistoric: true,
            minPrice,
            maxPrice,
            average,
            percentage,
            historicGraph,
            graph: true,
            period: "90days"
        };
    } catch (err) {
        let status = "";
        let message = err.message;
        try {
            const productParse = productInformationsByPeriod(local, historic, priceNotCaptured ? currentPrice : price, "182days", seePointsWithoutRepetition);
            status = productParse.status;
            message = `Desculpe, não temos dados suficientes ${Utils.formatPeriod(period).toLowerCase()}. <br> Veja ${Utils.formatPeriod("182days").toLowerCase()} `;
        } catch (error) {
            status = "withouthistory";
        }
        return {
            status,
            backgroundColor: "#47545B",
            statusTitle: "",
            statusMessage: "",
            statusLegend: message,
            hasHistoric: Utils.validateIfPeriodHasMinimumQuantityForCalculation(historic),
            graph: false,
            period: "182days"
        };
    }
}

export function formatProduct (product) {

    product.backgroundColor = selectMessageAndColorBaseByStatus(product.status).backgroundColor;
    product = formatImage(product);

    const period = (product.priceSummary || []).find(({
        days
    }) => days == "DAYS90") || {};

    delete product.priceSummary;

    if (period.average) product.average = period.average;
    else product.average = 0;

    return product;
}

export function formatImage (product) {
    product.images = product.images
        .filter(img => Utils.validateUrl(img))
        .map(image => image.replace(/^http?:/g, "https:"));

    const imgDefault = process.env.WHITELABEL_TOKEN === "vigiadepreco"
        ? "https://static.vigiadepreco.com.br/fa/3aa/63e2/9b06f/cb4941/no-image.png"
        : "https://static.server-static.com/5d/c98/86dd/67ef8/fab8c5/no-image-confieaqu.png";

    product.image = product.images && product.images.length > 0
        ? product.images[product.images.length - 1]
        : imgDefault;
    return product;
}

function getColorsByStatusAndWhitelabel (wl = "vigiadepreco") {
    let colors = {
        vigiadepreco: {
            lowestprice: "#1B5E20",
            belowaverage: "#4caf50",
            reasonableprice: "#fb8c00",
            expensive: "#E65100",
            veryexpensive: "#E53935",
            moreexpensive: "#B71C1C",
            noopinion: "#47545B",
            pricenotcaptured: "#47545B",
        },
        confieaqui: {
            lowestprice: "#02793E",
            belowaverage: "#A4C929",
            reasonableprice: "#F59900",
            expensive: "#E65100",
            veryexpensive: "#DF2930",
            moreexpensive: "#B20D14",
            noopinion: "#4B5963",
            pricenotcaptured: "#4B5963",
        }
    };

    return colors[wl] || colors.vigiadepreco;
}