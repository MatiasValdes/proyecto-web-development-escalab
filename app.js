let OFFSET = 0;
let lastGifTemplate;

const observadorFunction = new IntersectionObserver((entradas, observer) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            OFFSET += 10;
            if (valueInput) {
                searchHistory(valueInput);
            }
            else {
                trendingFunction();
            }
        }
    })
}, {
    rootMargin: '0px 0px 100px 0px',
    threshold: 1.0
});

//API REFERENCE
const API = 'https://api.giphy.com/v1/gifs/';
const API_KEY = 'GQsWZEl48tRv1bIxHTPRAnkYxRGNRMEe';
const NUM_LIMIT = 10;
const MAX_HISTORY_LENGTH = 3;

//HTML Nodes references
const button = document.getElementById('button_get');
const input = document.getElementById('input');
const results = document.getElementById('section_search_result');
const result_title = document.getElementById('section_result_title');
const searchs = document.getElementById('section_last_search_result');
const buttonTop = document.getElementById('button_top');

let valueInput = '';

//Get data from a API 
const getData = async (param) => {

    const API_TEND = `${API}trending?api_key=${API_KEY}&limit=${NUM_LIMIT}&offset=${OFFSET}&rating=g`;
    const API_SEARCH = `${API}search?api_key=${API_KEY}&q=${param}&limit=${NUM_LIMIT}&offset=${OFFSET}&rating=g`;

    if (param) {
        const res = await fetch(API_SEARCH);
        const data = await res.json();

        return data.data;
    }
    else {
        const res = await fetch(API_TEND);
        const data = await res.json();

        return data.data;
    }
};

//Config imgs on HTML COMPONENT
const figure = (props) => {

    const { title, images } = props;

    const figure = document.createElement('figure');
    const img = document.createElement('img');

    img.src = images.original.url;
    img.alt = title;

    figure.appendChild(img);
    figure.className = 'section_gif_container-gif';

    return figure
};

const trendingFunction = async () => {
    const data = await getData();

    const elem = data.map(item => figure(item));

    results.append(...elem);

    if (lastGifTemplate) {
        observadorFunction.unobserve(lastGifTemplate);
    }

    lastGifTemplate = elem.pop();

    observadorFunction.observe(lastGifTemplate);
};

const searchFunction = () => {

    valueInput = input.value;

    if (!valueInput) {

        validateSearch('Campo obligatorio');
        return;

    } else {
        OFFSET = 0
        document.getElementById('alert-error')?.remove();
        input.classList.remove('error_input');
        searchHistory(valueInput);
        createSearchHistory(valueInput);
    }
}

const lastSearchFunction = (e) => {
    e.preventDefault();

    OFFSET = 0;
    valueInput = e.target.value;

    searchHistory(valueInput);
}

const validateSearch = (error) => {
    const titleError = document.getElementById('alert-error');

    if (!titleError) {
        const title = document.createElement('p');
        title.textContent = error;
        title.id = 'alert-error';
        input.classList.add('error_input');
        setTimeout(function () {
            input.classList.remove("bounce");
        }, 1000);
        document.getElementById('header_content_search').appendChild(title);
    }
}

const searchHistory = async (searchParam) => {

    const data = await getData(searchParam);

    if (data.length === 0) {
        alertMessage('no existen resultados')
        return
    }

    if (OFFSET == 0) {
        results.innerHTML = '';
        result_title.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = `Resultados de la busqueda: ${searchParam}`;

        result_title.append(title);
    }

    const elem = data.map(item => figure(item));

    results.append(...elem);

    if (lastGifTemplate) {
        observadorFunction.unobserve(lastGifTemplate);
    }

    lastGifTemplate = elem.pop();

    observadorFunction.observe(lastGifTemplate);
}

// localstorage Function
const createSearchHistory = (searchParam) => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const isHistoryMaxed = history.length === MAX_HISTORY_LENGTH;
    const workingHistory = isHistoryMaxed ? history.slice(1) : history;
    const updatedHistory = workingHistory.concat(searchParam);

    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    updateSearchHistoryUi();
}

const updateSearchHistoryUi = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');

    searchs.innerHTML = '';

    var div = document.createElement('div');

    searchs.append(history.map(v => {
        var span = document.createElement('span');
        span.textContent = v;
        span.className = 'badge';
        span.value = v
        searchs.appendChild(span);
        span.addEventListener('click', lastSearchFunction);
    }).join(''));

    // searchs.appendChild(div);
}

// alert function
const alertMessage = (msg) => {
    const divAlertWrapper = document.createElement('div');
    divAlertWrapper.classList.add('alert_wrapper');

    const divAlertBackdrop = document.createElement('div');
    divAlertBackdrop.classList.add('alert_backdrop');

    divAlertWrapper.append(divAlertBackdrop);

    const divAlertItemWarning = document.createElement('div');
    divAlertItemWarning.classList.add('alert_item');
    divAlertItemWarning.classList.add('alert_warning');

    const divAlertIconDataIcon = document.createElement('div');
    divAlertIconDataIcon.classList.add('icon');
    divAlertIconDataIcon.classList.add('data_icon');

    const iconTriangle = document.createElement('i');
    iconTriangle.classList.add('fas');
    iconTriangle.classList.add('fa-exclamation-triangle');

    divAlertIconDataIcon.append(iconTriangle);

    const divData = document.createElement('div');
    divData.classList.add('data');

    const pSubData = document.createElement('p');
    pSubData.textContent = msg
    pSubData.classList.add('sub');

    divData.append(pSubData);

    const divIconClose = document.createElement('div');
    divIconClose.classList.add('icon');
    divIconClose.classList.add('close');

    const iconTimes = document.createElement('i');
    iconTimes.classList.add('fas');
    iconTimes.classList.add('fa-times');

    divIconClose.append(iconTimes);

    divAlertItemWarning.append(divAlertIconDataIcon);
    divAlertItemWarning.append(divData);
    divAlertItemWarning.append(divIconClose);

    divAlertWrapper.append(divAlertItemWarning);


    const alertSHow = document.getElementById('alert-show');
    // alertSHow.innerHTML = elem;
    alertSHow.append(divAlertWrapper);

    // element alert
    var alert_item = document.querySelectorAll(".alert_item");
    var alert_wrapper = document.querySelector(".alert_wrapper");

    alert_wrapper.classList.add("active");
    // alert_item.style.top = "50%";

    divIconClose.onclick = function () {
        alert_wrapper.classList.remove("active");
        alertSHow.innerHTML = '';
    }
}

//scroll function
const scrollFunction = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        buttonTop.style.display = "block";
    } else {
        buttonTop.style.display = "none";
    }
}

const topFunction = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.onscroll = () => {
    scrollFunction();
};

//AddEventListener
button.addEventListener('click', searchFunction);
buttonTop.addEventListener('click', topFunction);

//call function
trendingFunction();
updateSearchHistoryUi();