export const initializeHandlebars = () => {
	registerHandlebarsHelpers();
};

function registerHandlebarsHelpers() {
	/* -------------------------------------------- */
	/*  Handlebars Helpers                          */
	/* -------------------------------------------- */

	// If you need to add Handlebars helpers, here is a useful example:
	Handlebars.registerHelper('toLowerCase', function (str) {
		return str.toLowerCase();
	});

	Handlebars.registerHelper('toUpperCase', function (str) {
		return str.toUpperCase();
	});

	Handlebars.registerHelper('capitalise', function (str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	});

	/*
	 * Repeat given markup with n times
	 */
	Handlebars.registerHelper('times', function (n, block) {
		var result = '';
		for (let i = 0; i < n; ++i) {
			result += block.fn(i);
		}
		return result;
	});

	Handlebars.registerHelper('keepMarkup', function (text) {
		return new Handlebars.SafeString(text);
	});

	Handlebars.registerHelper('removeMarkup', function (text) {
		const markup = /<(.*?)>/gi;
		return new Handlebars.SafeString(text.replace(markup, ''));
	});

	Handlebars.registerHelper('ifSetting', function (v1, options) {
		if (game.settings.get('talesoftheoldwest', v1)) return options.fn(this);
		else return options.inverse(this);
	});

	Handlebars.registerHelper('striptags', function (txt) {
		// exit now if text is undefined
		if (typeof txt == 'undefined') return;
		// the regular expresion
		var regexp = /<[\/\w]+>/g;
		// replacing the text
		return txt.replace(regexp, '');
	});

	Handlebars.registerHelper('addstats', function (v1, v2) {
		return v1 + v2;
	});

	Handlebars.registerHelper('totowConcat', function () {
		var outStr = '';
		for (var arg in arguments) {
			if (typeof arguments[arg] != 'object') {
				outStr += arguments[arg];
			}
		}
		return outStr;
	});
}
