if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        var result = '';
        var format = this;

        for (var i = 0; ; ) {
            // Find the next opening or closing brace
            var open = format.indexOf('{', i);
            var close = format.indexOf('}', i);
            if ((open < 0) && (close < 0)) {
                // Not found: copy the end of the string and break
                result += format.slice(i);
                break;
            }
            if ((close > 0) && ((close < open) || (open < 0))) {

                if (format.charAt(close + 1) !== '}') {
                    throw new Error('format stringFormatBraceMismatch');
                }

                result += format.slice(i, close + 1);
                i = close + 2;
                continue;
            }

            // Copy the string before the brace
            result += format.slice(i, open);
            i = open + 1;

            // Check for double braces (which display as one and are not arguments)
            if (format.charAt(i) === '{') {
                result += '{';
                i++;
                continue;
            }

            if (close < 0) throw new Error('format stringFormatBraceMismatch');

            // Find the closing brace

            // Get the string between the braces, and split it around the ':' (if any)
            var brace = format.substring(i, close);
            var colonIndex = brace.indexOf(':');
            var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);

            if (isNaN(argNumber)) throw new Error('format stringFormatInvalid');

            var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
            
            if (argNumber < args.length) {                
                var arg = args[argNumber].toString();
                if (typeof (arg) === "undefined" || arg === null) {
                    arg = '';
                }

                // If it has a toFormattedString method, call it.  Otherwise, call toString()
                if (arg.toFormattedString && argFormat != "") {
                    arg = arg.toFormattedString(argFormat);
                }
                result += arg;
            }
            
            i = close + 1;
        }

        return result;
    };
}

if (!String.prototype.toFormattedString) {
    String.prototype.toFormattedString = function() {
        var originalString = this;
        var format = arguments[0];
        var digit = -1;
        
        if (format.length > 1) {
            var digit = parseInt(format.substring(0, format.length-1));
            var format = format.substring(format.length-1);
        }

        if (format == "d") {
            return parseInt(originalString).toString();
        } else if (format == "f") {
            var number = parseFloat(originalString);
            if (digit > -1) {
                number = number.round(digit);
            }
            return number.toString();
        } else if (format == "p") {
            var number = parseFloat(originalString) * 100;
            if (digit > -1) {
                number = number.round(digit);
            }
            return number.toString();
        }
        
        return originalString.toString();
    }
}

if (!Number.prototype.round) {
    Number.prototype.round = function() {
        var number = this;
        var digit = parseInt(arguments[0]);
        return +(Math.round(number + "e+" + digit)  + "e-" + digit);
    }
}

function GetElementOffset(e) {
    var offset = {x:0,y:0};
    while (e)
    {
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
    }

    if (document.documentElement && (document.documentElement.scrollTop || document.documentElement.scrollLeft))
    {
        offset.x -= document.documentElement.scrollLeft;
        offset.y -= document.documentElement.scrollTop;
    }
    else if (document.body && (document.body.scrollTop || document.body.scrollLeft))
    {
        offset.x -= document.body.scrollLeft;
        offset.y -= document.body.scrollTop;
    }
    else if (window.pageXOffset || window.pageYOffset)
    {
        offset.x -= window.pageXOffset;
        offset.y -= window.pageYOffset;
    }
    
    return offset;
}

function GetClientWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
}

function GetClientHeight() {
    return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
}

function getCSSRule(ruleName, deleteFlag) {               // Return requested style obejct
   ruleName=ruleName.toLowerCase();                       // Convert test string to lower case.
   if (document.styleSheets) {                            // If browser can play with stylesheets
      for (var i=0; i<document.styleSheets.length; i++) { // For each stylesheet
         var styleSheet=document.styleSheets[i];          // Get the current Stylesheet
         var ii=0;                                        // Initialize subCounter.
         var cssRule=false;                               // Initialize cssRule. 
         do {                                             // For each rule in stylesheet
            if (styleSheet.cssRules) {                    // Browser uses cssRules?
               cssRule = styleSheet.cssRules[ii];         // Yes --Mozilla Style
            } else {                                      // Browser usses rules?
               cssRule = styleSheet.rules[ii];            // Yes IE style. 
            }                                             // End IE check.
            if (cssRule)  {                               // If we found a rule...
               if (cssRule.selectorText.toLowerCase()==ruleName) { //  match ruleName?
                  if (deleteFlag=='delete') {             // Yes.  Are we deleteing?
                     if (styleSheet.cssRules) {           // Yes, deleting...
                        styleSheet.deleteRule(ii);        // Delete rule, Moz Style
                     } else {                             // Still deleting.
                        styleSheet.removeRule(ii);        // Delete rule IE style.
                     }                                    // End IE check.
                     return true;                         // return true, class deleted.
                  } else {                                // found and not deleting.
                     return cssRule;                      // return the style object.
                  }                                       // End delete Check
               }                                          // End found rule name
            }                                             // end found cssRule
            ii++;                                         // Increment sub-counter
         } while (cssRule)                                // end While loop
      }                                                   // end For loop
   }                                                      // end styleSheet ability check
   return false;                                          // we found NOTHING!
}                                                         // end getCSSRule 

function killCSSRule(ruleName) {                          // Delete a CSS rule   
   return getCSSRule(ruleName,'delete');                  // just call getCSSRule w/delete flag.
}                                                         // end killCSSRule

function addCSSRule(ruleName) {                           // Create a new css rule
   if (document.styleSheets) {                            // Can browser do styleSheets?
      if (!getCSSRule(ruleName)) {                        // if rule doesn't exist...
         if (document.styleSheets[0].addRule) {           // Browser is IE?
            document.styleSheets[0].addRule(ruleName, null,0);      // Yes, add IE style
         } else {                                         // Browser is IE?
            document.styleSheets[0].insertRule(ruleName+' { }', 0); // Yes, add Moz style.
         }                                                // End browser check
      }                                                   // End already exist check.
   }                                                      // End browser ability check.
   return getCSSRule(ruleName);                           // return rule we just created.
} 

function IsNull(obj) {
    if (typeof(obj) == "undefined" || obj == null) {
        return true;
    } else {
        return false;
    }
}