(function () {
    "use strict";

    var $ = require('jquery');
    var handlebars = require('handlebars');
    var impress = require('impress');

    handlebars.registerHelper('step', function (data) {
        var ret = '';
        for (var key in data) {
            ret = ret + ' data-' + key + '="' + data[key] + '"';
        }
        return ret;
    });

    $(function () {
        $.getJSON('steps/steps.json', function (data) {
            var steps = data;
            var htmltemplate = $('#step-template').html();
            var htmltempl = handlebars.compile(htmltemplate);
            steps.forEach(function (step, index) {
                var templ = htmltempl;
                console.log(step);
                $.ajax({
                    url: '/steps/' + step.uri,
                    success: function (data) {
                        $('.steps').append(templ({file: data, data: step.data,
                            class: step.class, id: step.id}));
                    },
                    async: false
                });
            });
            impress().init();
        });
    });
})();