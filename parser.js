const axios = require('axios');
const cheerio = require('cheerio');

const Parser = async (login, surname) => {
    const start= new Date().getTime();
    const getHTML = async (url) => {
        const Sstart= new Date().getTime();

        const { data } = await axios.get(url);

        const Send= new Date().getTime();
        console.log(`req time: ${Send-Sstart}`);
        return cheerio.load(data);
    };

    login = (login === '') ? '%' : login;
    surname = (surname === '' || surname === 'getall') ? '%' : surname;
    
    const urlReqBase = 'http://students.gsu.by/frontpage?title=' + login + '&field_surname_value=' + surname;
    
    const sstart= new Date().getTime();
    let $ = await getHTML(urlReqBase);
    const Send= new Date().getTime();
    console.log(`req+cheerio time: ${Send-sstart}`);

    let personId = 0;
    const listPersonData = new Array();

    const numOfPage = ( $('.pager-item').toArray().length > 0 ) ? parseInt($('.pager-last a').attr().href.split('=').slice(-1)[0]) : 1;
    for( let page = 1; page <= numOfPage; page++ ) {
        console.clear();
        console.log(`Complited ${(page/numOfPage*100).toFixed(0)}%`);
        console.log('['+ '#'.repeat((page/numOfPage*100).toFixed(0)) + '_'.repeat(100-(page/numOfPage*100).toFixed(0)) + ']' );

        if( page > 1 && numOfPage > 1 ) 
            $ = await getHTML(urlReqBase + '25&page=' + page)

        const numOfProfiles = $('.views-row').toArray().length;
        for( let i = 1; i <= numOfProfiles; i++ ) {
            const classOfPerson = '.views-row-' + i;
            const numOfSession = $(classOfPerson + ' .field-block').toArray().length;

            const dataObj = {
                id: ++personId,
                personalData: {
                    surname: $(classOfPerson + ' .views-field-field-surname .field-content').html(),
                    name: $(classOfPerson + ' .views-field-field-name .field-content').html(),
                    patronymic: $(classOfPerson + ' .views-field-field-middle-name .field-content').html(),
                    faculty: $(classOfPerson + ' .views-field-field-faculty .field-content').html(),
                    specialty: $(classOfPerson + ' .views-field-field-specialty .field-content').html(),
                    group: $(classOfPerson + ' .views-field-field-group .field-content').html(),
                },
                session: new Array(numOfSession)
            };

            for ( let j = 0; j < numOfSession; j++ ) {
                const sessionHTML = cheerio.load($(classOfPerson + ' .field-block').eq(j).html());
                const numOfObjects = sessionHTML('li').toArray().length;
                
                dataObj.session[j] = {
                    sessionNumber: (sessionHTML('h3').html().length == 8) ? parseInt(sessionHTML('h3').html()[7]) : 0,
                    marks: new Array(numOfObjects)
                }

                for ( let k = 0; k < numOfObjects; k++ ) {
                    const objectHTML = cheerio.load(sessionHTML('li').eq(k).html());

                    dataObj.session[j].marks[k] = {
                        object: objectHTML('.caption').html(),
                        result: (objectHTML('.value').html() == 'Зачет') ? true : (objectHTML('.value').html() == 'Незачет') ? false : (objectHTML('.value').html().length == 0) ? null : parseInt(objectHTML('.value').html())
                    }
                }
            }
            listPersonData.push(dataObj);
        }
    }
    
    const end = new Date().getTime();
    console.log(end-start);
    return (listPersonData.length === 0) ? false : listPersonData;
};

const SmallParser = async (login, surname) => {
    const start= new Date().getTime();
    const getHTML = async (url) => {
        const Sstart= new Date().getTime();

        const { data } = await axios.get(url);

        const Send= new Date().getTime();
        console.log(`req time: ${Send-Sstart}`);
        return cheerio.load(data);
    };

    login = (login === '') ? '%' : login;
    surname = (surname === '' || surname === 'getall') ? '%' : surname;

    const urlReqBase = 'http://students.gsu.by/frontpage?title=' + login + '&field_surname_value=' + surname;
    let $ = await getHTML(urlReqBase);

    let personId = 0;
    const listPersonData = new Array();

    const numOfPage = ( $('.pager-item').toArray().length > 0 ) ? parseInt($('.pager-last a').attr().href.split('=').slice(-1)[0]) : 1;
    for( let page = 1; page <= numOfPage; page++ ) {
        console.clear();
        console.log(`Complited ${(page/numOfPage*100).toFixed(0)}%`);
        console.log('['+ '#'.repeat((page/numOfPage*100).toFixed(0)) + '_'.repeat(100-(page/numOfPage*100).toFixed(0)) + ']' );

        if( page > 1 && numOfPage > 1 ) 
            $ = await getHTML(urlReqBase + '25&page=' + page)

        const numOfProfiles = $('.views-row').toArray().length;
        for( let i = 1; i <= numOfProfiles; i++ ) {
            const classOfPerson = '.views-row-' + i;

            listPersonData.push({
                id: ++personId,
                personalData: {
                    surname: $(classOfPerson + ' .views-field-field-surname .field-content').html(),
                    name: $(classOfPerson + ' .views-field-field-name .field-content').html(),
                    patronymic: $(classOfPerson + ' .views-field-field-middle-name .field-content').html(),
                    group: $(classOfPerson + ' .views-field-field-group .field-content').html(),
                }
            });
        }
    }
    
    const end = new Date().getTime();
    console.log(end-start);
    return (listPersonData.length === 0) ? false : listPersonData;
};

SmallParser('20-ПМС-%','').then((res) => {
    //console.log(res);
});

Parser('20-ПМС-%','').then((res) => {
    //console.log(res);
});

module.exports = Parser;