/**
 * PrimeFaces SimpleDateFormat widget, code ported from Tim Down's http://www.timdown.co.uk/code/simpledateformat.php
 */
PrimeFaces.widget.SimpleDateFormat = Class.extend({
    
    init: function(cfg) {
        this.cfg = cfg;
        this.cfg.regex = /('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/
        this.cfg.TEXT2 = 0;
        this.cfg.TEXT3 = 1;
        this.cfg.NUMBER = 2;
        this.cfg.YEAR = 3;
        this.cfg.MONTH = 4;
        this.cfg.TIMEZONE = 6;
        this.cfg.types = {
            G : this.cfg.TEXT2,
            y : this.cfg.YEAR,
            M : this.cfg.MONTH,
            w : this.cfg.NUMBER,
            W : this.cfg.NUMBER,
            D : this.cfg.NUMBER,
            d : this.cfg.NUMBER,
            F : this.cfg.NUMBER,
            E : this.cfg.TEXT3,
            a : this.cfg.TEXT2,
            H : this.cfg.NUMBER,
            k : this.cfg.NUMBER,
            K : this.cfg.NUMBER,
            h : this.cfg.NUMBER,
            m : this.cfg.NUMBER,
            s : this.cfg.NUMBER,
            S : this.cfg.NUMBER,
            Z : this.cfg.TIMEZONE
        };
        
        this.cfg.ONE_DAY = 24 * 60 * 60 * 1000;
        this.cfg.ONE_WEEK = 7 * this.cfg.ONE_DAY;
        this.cfg.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK = 1;
        
        if(this.cfg.locale && PrimeFaces.locales[this.cfg.locale]) {
            this.cfg.monthNames = PrimeFaces.locales[this.cfg.locale].monthNames;
            this.cfg.dayNames = PrimeFaces.locales[this.cfg.locale].dayNames;
        } 
        else {
            this.cfg.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            this.cfg.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        }
    },
    
    newDateAtMidnight: function(year, month, day) {
        var d = new Date(year, month, day, 0, 0, 0);
        d.setMilliseconds(0);
        
        return d;
    },
    
    getDifference : function(date1, date2) {
        return date1.getTime() - date2.getTime();
    },
    
    isBefore : function(date1, date2) {
        return date1.getTime() < date2.getTime();
    },

    getUTCTime: function(date) {
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    },
    
    getTimeSince: function(date1, date2) {
        return date1.getUTCTime() - date2.getUTCTime();
    },

    getPreviousSunday: function(date) {
        // Using midday avoids any possibility of DST messing things up
        var midday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
        var previousSunday = new Date(midday.getTime() - date.getDay() * this.cfg.ONE_DAY);
        
        return this.newDateAtMidnight(previousSunday.getFullYear(), previousSunday.getMonth(), previousSunday.getDate());
    },

    getWeekInYear : function(date, minimalDaysInFirstWeek) {
        if(!this.minimalDaysInFirstWeek) {
            minimalDaysInFirstWeek = this.cfg.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
        }
        
        var previousSunday = this.getPreviousSunday(date);
        var startOfYear = this.newDateAtMidnight(date.getFullYear(), 0, 1);
        var numberOfSundays = previousSunday.isBefore(startOfYear) ? 0 : 1 + Math.floor(previousSunday.getTimeSince(startOfYear) / this.cfg.ONE_WEEK);
        var numberOfDaysInFirstWeek =  7 - startOfYear.getDay();
        var weekInYear = numberOfSundays;
        if (numberOfDaysInFirstWeek < minimalDaysInFirstWeek) {
            weekInYear--;
        }
        
        return weekInYear;
    },

   getWeekInMonth: function(date, minimalDaysInFirstWeek) {
        if(!this.minimalDaysInFirstWeek) {
            minimalDaysInFirstWeek = this.cfg.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
        }
        
        var previousSunday = this.getPreviousSunday(date);
        var startOfMonth = this.newDateAtMidnight(date.getFullYear(), date.getMonth(), 1);
        var numberOfSundays = previousSunday.isBefore(startOfMonth) ? 0 : 1 + Math.floor((previousSunday.getTimeSince(startOfMonth)) / this.cfg.ONE_WEEK);
        var numberOfDaysInFirstWeek =  7 - startOfMonth.getDay();
        var weekInMonth = numberOfSundays;
        if (numberOfDaysInFirstWeek >= minimalDaysInFirstWeek) {
            weekInMonth++;
        }
        
        return weekInMonth;
    },

    getDayInYear: function(date) {
        var startOfYear = this.newDateAtMidnight(date.getFullYear(), 0, 1);
        
        return 1 + Math.floor(this.getTimeSince(startOfYear) / this.cfg.ONE_DAY);
    },
    
    setMinimalDaysInFirstWeek: function(days) {
        this.minimalDaysInFirstWeek = days;
    },

    getMinimalDaysInFirstWeek: function(days) {
        return this.minimalDaysInFirstWeek	? this.cfg.DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK : this.minimalDaysInFirstWeek;
    },

    format: function(date) {
        var formattedString = "";
        var result;

        var padWithZeroes = function(str, len) {
            while (str.length < len) {
                str = "0" + str;
            }
            return str;
        };

        var formatText = function(data, numberOfLetters, minLength) {
            return (numberOfLetters >= 4) ? data : data.substr(0, Math.max(minLength, numberOfLetters));
        };

        var formatNumber = function(data, numberOfLetters) {
            var dataString = "" + data;
            // Pad with 0s as necessary
            return padWithZeroes(dataString, numberOfLetters);
        };

        var searchString = this.cfg.pattern;
        while ((result = this.cfg.regex.exec(searchString))) {
            var matchedString = result[0];
            var quotedString = result[1];
            var patternLetters = result[2];
            var otherLetters = result[3];
            var otherCharacters = result[4];

            // If the pattern matched is quoted string, output the text between the quotes
            if (quotedString) {
                if (quotedString == "''") {
                    formattedString += "'";
                } else {
                    formattedString += quotedString.substring(1, quotedString.length - 1);
                }
            } else if (otherLetters) {
            // Swallow non-pattern letters by doing nothing here
            } else if (otherCharacters) {
                // Simply output other characters
                formattedString += otherCharacters;
            } else if (patternLetters) {
                // Replace pattern letters
                var patternLetter = patternLetters.charAt(0);
                var numberOfLetters = patternLetters.length;
                var rawData = "";
                switch (patternLetter) {
                    case "G":
                        rawData = "AD";
                        break;
                    case "y":
                        rawData = date.getFullYear();
                        break;
                    case "M":
                        rawData = date.getMonth();
                        break;
                    case "w":
                        rawData = this.getWeekInYear(date, this.getMinimalDaysInFirstWeek());
                        break;
                    case "W":
                        rawData = date.getWeekInMonth(date, this.getMinimalDaysInFirstWeek());
                        break;
                    case "D":
                        rawData = date.getDayInYear();
                        break;
                    case "d":
                        rawData = date.getDate();
                        break;
                    case "F":
                        rawData = 1 + Math.floor((date.getDate() - 1) / 7);
                        break;
                    case "E":
                        rawData = this.cfg.dayNames[date.getDay()];
                        break;
                    case "a":
                        rawData = (date.getHours() >= 12) ? "PM" : "AM";
                        break;
                    case "H":
                        rawData = date.getHours();
                        break;
                    case "k":
                        rawData = date.getHours() || 24;
                        break;
                    case "K":
                        rawData = date.getHours() % 12;
                        break;
                    case "h":
                        rawData = (date.getHours() % 12) || 12;
                        break;
                    case "m":
                        rawData = date.getMinutes();
                        break;
                    case "s":
                        rawData = date.getSeconds();
                        break;
                    case "S":
                        rawData = date.getMilliseconds();
                        break;
                    case "Z":
                        rawData = date.getTimezoneOffset(); // This is returns the number of minutes since GMT was this time.
                        break;
                }
                // Format the raw data depending on the type
                switch (this.cfg.types[patternLetter]) {
                    case this.cfg.TEXT2:
                        formattedString += formatText(rawData, numberOfLetters, 2);
                        break;
                    case this.cfg.TEXT3:
                        formattedString += formatText(rawData, numberOfLetters, 3);
                        break;
                    case this.cfg.NUMBER:
                        formattedString += formatNumber(rawData, numberOfLetters);
                        break;
                    case this.cfg.YEAR:
                        if (numberOfLetters <= 3) {
                            // Output a 2-digit year
                            var dataString = "" + rawData;
                            formattedString += dataString.substr(2, 2);
                        } else {
                            formattedString += formatNumber(rawData, numberOfLetters);
                        }
                        break;
                    case this.cfg.MONTH:
                        if (numberOfLetters >= 3) {
                            formattedString += formatText(this.cfg.monthNames[rawData], numberOfLetters, numberOfLetters);
                        } else {
                            // NB. Months returned by getMonth are zero-based
                            formattedString += formatNumber(rawData + 1, numberOfLetters);
                        }
                        break;
                    case this.cfg.TIMEZONE:
                        var isPositive = (rawData > 0);
                        // The following line looks like a mistake but isn't
                        // because of the way getTimezoneOffset measures.
                        var prefix = isPositive ? "-" : "+";
                        var absData = Math.abs(rawData);

                        // Hours
                        var hours = "" + Math.floor(absData / 60);
                        hours = padWithZeroes(hours, 2);
                        // Minutes
                        var minutes = "" + (absData % 60);
                        minutes = padWithZeroes(minutes, 2);

                        formattedString += prefix + hours + minutes;
                        break;
                }
            }
            
            searchString = searchString.substr(result.index + result[0].length);
        }
        return formattedString;
    }
});

/**
 *  PrimeFaces Clock Widget 
 */
PrimeFaces.widget.Clock = PrimeFaces.widget.BaseWidget.extend({
    
    init: function(cfg) {
        this._super(cfg);
        
        this.cfg.pattern = this.cfg.pattern||"MM/dd/yyyy HH:mm:ss";
        this.cfg.dateFormat = new PrimeFaces.widget.SimpleDateFormat({
            pattern: this.cfg.pattern,
            locale: this.cfg.locale
        });
        this.current = this.isClient() ? new Date() : new Date(this.cfg.value);

        this.start();
        
        var $this = this;
        if(!this.isClient() && this.cfg.autoSync) {
            setInterval(function() {
                $this.sync();
            }, this.cfg.syncInterval);
        }
    },
    
    isClient: function() {
        return this.cfg.mode === 'client';
    },
    
    start: function() {
        var $this = this;
        this.interval = setInterval(function(){
            $this.updateOutput();
        }, 1000);
    },
    
    stop: function() {
        clearTimeout(this.interval);
    },
     
    updateOutput: function() {
        this.current.setSeconds(this.current.getSeconds() + 1);
        this.jq.text(this.cfg.dateFormat.format(this.current));   
    },
    
    sync: function() {
        this.stop();
        
        var $this = this,
        options = {
            source: this.id,
            process: this.id,
            async: true,
            global: false,
            params: [{
                name: this.id + '_sync', value: true
            }],
            oncomplete: function(xhr, status, args) {
                $this.current = new Date(args.datetime);
                $this.start();
            }
        };
        
        PrimeFaces.ajax.AjaxRequest(options);
    }
});