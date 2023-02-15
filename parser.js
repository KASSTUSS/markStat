const axios = require('axios');
const cheerio = require('cheerio');

const Parser = async (searchSurname, studyGroup) => {
    let listPersonData = [];
    let personId = 0;

    const getHTML = async (url) => {
        const { data } = await axios.get(url);
        return cheerio.load(data);
    };

    
    let $ = await getHTML('http://students.gsu.by/frontpage?title=' + studyGroup + '%&field_surname_value=' + searchSurname);
    
    const numOfPage = ( $('.pager-item').toArray().length > 0 ) ? parseInt($('.pager-last a').attr().href.split('=').slice(-1)[0]) : false;

    let urlLink = 'http://students.gsu.by/frontpage?title=' + studyGroup + '%&field_surname_value=' + searchSurname;

    $ = await getHTML(urlLink);
    const numOfProfiles = $('.views-row').toArray().length;

    for( let i = 1; i <= numOfProfiles; i++ ) {
        const classOfPerson = '.views-row-' + i;
        const numOfSession = $(classOfPerson + ' .field-block').toArray().length;

        const dataObj = {
            id: null,
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
                    result: (objectHTML('.value').html() == 'Р—Р°С‡РµС‚') ? true : (objectHTML('.value').html() == 'РќРµР·Р°С‡РµС‚') ? false : (objectHTML('.value').html().length == 0) ? null : parseInt(objectHTML('.value').html())
                }
            }
        }
        
        dataObj.id = ++personId;
        listPersonData.push(dataObj);
    }
    if(numOfPage) {
        for(let page = 1; page <= numOfPage; page++) {

            let urlLink = 'http://students.gsu.by/frontpage?title=' + studyGroup + '%&field_surname_value=' + searchSurname + '25&page=' + page;

            $ = await getHTML(urlLink);
            const numOfProfiles = $('.views-row').toArray().length;

            for( let i = 1; i <= numOfProfiles; i++ ) {
                const classOfPerson = '.views-row-' + i;
                const numOfSession = $(classOfPerson + ' .field-block').toArray().length;

                const dataObj = {
                    id: null,
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

                dataObj.id = ++personId;
                listPersonData.push(dataObj);
            }
        }
    }

    

    return (listPersonData.length === 0) ? false : listPersonData;
};

// const res = Parser('%', '20-ПМС-');

// res.then( result => {
//     console.log(result);
//     console.log(result.length)
// });

module.exports = Parser;