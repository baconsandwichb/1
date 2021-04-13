/**
 * Commands and utilities used by the eAISCommands frame
 * 1.1.4.1
 * 2015/12/18 04:03:54
 */
 
 /** Enable the debugging messages */
 var DEBUG = TRUE;
 
 /**********************************/
 /**     PDF-related commands     **/
 
 var PDF_LOCATION = "/pdf/";
 
 /** HTML is located in /html/eAIP or /html/eAIC or /html/eSUP*/
 var HTML_LOCATION = /\/html\/\D{4}\//;
 
 /**
  * Replaces the path and suffix to point to the associated PDF file
  * Warning: blindly replaces ".html" by ".pdf". Using this function
  * on paths which may contain this string several times will result 
  * in problems.
  *
  * @param href String URL
  * @return String an href with .html replaced with .pdf
  */
 function getAsPdf(href) {
 	var value = new String(href);
 	
 	var search = /\/html\/(..-)?cover-([^\.]*)\.html/;
 	//search = /\/html\/EC-cover-en-GB\.html/;
 	var replace = "/pdf/$1amdt.pdf";
 	if (value.match(search) != null) {
 	    // redirect cover page to paper AMDT
 	    var ret = value.replace(search, replace);
 	    return ret;
 	}
 	
	// Bug in IE 6 on NT4 and 2000: anchors on PDF links lead to non-existant pages. 
	// Bugfix: strip the anchor for all IE (for PDF)
 	if (navigator.appName == "Microsoft Internet Explorer") {
		search = /\.html(?:\?.+)?(?:#.*)?/;
	}
	else {
		search = ".html";
	}
 	replace = ".pdf";
 	var value2 = value.replace(search, replace);
 	var noLang = stripLanguage(value2); 
 	search = HTML_LOCATION;
 	replace = PDF_LOCATION;
 	return noLang.replace(search, replace);
 }
 
 /**
  * Return the URL displayed in the content frame, but as target the associated PDF file
  */
 function getContentAsPdf() {
 	var frame = window.top.frames["eAISContent"];
 	var location = frame.location.href;
 	return getAsPdf(location);
 }
 
 /**
  * Change the href property of an element with the URL of the PDF with the content
  * the HTML currently viewed
  */
 function changeHrefToPdf(element) {
 	element.href = getContentAsPdf();
 }
 
 /**********************************/
 /**  Language switching commands **/
 
 /** String used in url rewriting to specify the target */
 var TARGET = "target";
 var MENUSTATE = "menuState";
 
 /** String used to separate entries */
 var SEPARATOR = ",";
 /** String used in url rewriting to specify the elements which are opened in the navigation menu */
 var IDREF = "idRef";
 
 
 /**
  * Append to the href property of element the modified target with changed language
  *
  * @param element And element that has an href property
  */
 function appendTarget(element) {
 	
 	var link = new String(element.href);
 	var lang = getLanguage(link);
 	if (DEBUG) alert("lang is " + lang);
 	
 	// Get the target
 	var target = window.top.frames["eAISContent"].location.href;
 	if (DEBUG) alert("Target is " + target);
 	
 	// Replace the language
 	var newTarget = changeLanguage(target, lang);
 	if (DEBUG) alert("newTarget is " + newTarget);
 	
 	// Append to the URL the link
 	var result = link + "?" + TARGET + "=" + escape(newTarget);
 	//if (DEBUG) alert("result is " + result);
 	
// 	file:///C:/Users/User/Documents/Eurocontrol/eAIP-2.0/Samples/2004-06-10-AIRAC-bilingual/html/index-en-GB.html
// 	?target=file%3A///C%3A/Users/User/Documents/Eurocontrol/eAIP-2.0/Samples/2004-06-10-AIRAC-bilingual/html/
// 			EC-cover-en-GB.html
// 	&menuState=file%3A///C%3A/Users/User/Documents/Eurocontrol/eAIP-2.0/Samples/2004-06-10-AIRAC-bilingual/html/eAIP/
// 	EC-menu-en-GB.html,GEN,ENR,AD
 	
 		// Append the menu state
 	var menuState = getMenuState(lang);
 	var result2 = result + "&" + MENUSTATE + "=" + menuState;
 	if (DEBUG) alert("result2 is " + result);
 	
 	element.href = result2;
 }
 
 /**
  * Open the target specified on the location of the top frame in the eAISContent frame
  */
 function openTarget() {
 	// Parse the URL
 	var location = window.top.location.href; 
 	var target = extractTarget(location);
 	if (DEBUG) alert("Opening target: " + unescape(target));
 	if (target) {
	 	// Set the eAISContent frame location to that value
	 	window.top.frames["eAISContent"].location.href = unescape(target);
 	}
 	
 	var menuState = extractMenuState(location);
 	if (menuState) {
 		redirectMenu(menuState);
 	}
 }
 
 /**
  * Get the menu page that is opened, and the ids of the elements that are opened
  *
  * @param language The language that will be substituted in the locations
  * @return state as a string, with the language changed
  * @see #restoreMenuState(String)
  */
 function getMenuState(language) {
 	var targetWindow = window.top.frames["eAISNavigationBase"].frames["eAISNavigation"];
 	var loc = targetWindow.location.href;
 	if (DEBUG) alert("Location of eAISNavigation is" + loc);
 	
 	// Change the language of the location
 	var newLoc = changeLanguage(loc, language);
 	if (DEBUG) alert("New location " + newLoc);
 	
 	var result = new String(escape(newLoc)) + "?";
 	
 	// Get the a elements that contain an id ending with plus
 	var links = targetWindow.document.getElementsByTagName("A");
 	// The regexp matches IDplus, where ID is the id that we want to expand
 	var PLUS = /(.*)plus/;
 	
 	for (i=0; i < links.length; i++) {
 		// See if it has an id that finishes with plus
 		var id = new String(links[i].id);
 		//if (DEBUG) alert("Trying finding element in: " + id );
 		var match = id.match(PLUS);
 		
 		if (match && links[i].innerHTML == "-") { // A - denotes an opened section
 			var elementId = match[1]; //
 			if (DEBUG) alert("Element matches: " + elementId );
 			// Append the element name to the string
 			result = result + SEPARATOR + elementId;
 		}
 		
 	}
 	return result;
 }
 
 /**
  * 
  */
 function redirectMenu(location) { 
 
 	// redirect the menu to the right navigation menu
 	// passing as parameters the ids of the nodes to be expanded
 	var targetWindow = window.top.frames["eAISNavigationBase"].frames["eAISNavigation"];
 	
 	// We need the unescaped location to be able to match the separator.
 	var unescapedLocation = unescape(location);
 	
 	// Location of the first expanded section separator, i.e. ","
 	var firstSep = unescapedLocation.indexOf(SEPARATOR);
 	
 	if (firstSep > 0) {
 	 	
	 	// The target is the substring from 0 to firstSep
	 	var redirect = unescapedLocation.substr(0, firstSep);
	 	if (DEBUG) alert("Redirect menu location is: " + redirect); 
	 	
	 	// Then we append the rest as a parameter called id
	 	// +1 is because we skip the separator
	 	var completeRedirect = redirect + "?" + IDREF + "=" + unescapedLocation.substr(firstSep + 1, unescapedLocation.length);
	 	if (DEBUG) alert("Complete redirect menu location is: " + completeRedirect);
	 	
	 	targetWindow.location.href = completeRedirect;
 	} else {
 		// There are no other arguments after the target
 		targetWindow.location.href = unescapedLocation;
 	}
 	// Then we run restore menus state on that frame
 	//restoreMenuState();
 }
 
 /**
  * Restore the state of the menu
  */
 function restoreMenuState() {
 	var location = window.location.href;
 	
 	// Extract the stuff after IDREF
 	var split = location.split(IDREF + "=");
 	if (split.length < 2) return;
 	
 	// then expand these ids if they exist
 	expandIds(split[split.length - 1]);
 }
 
 /**
  * Restore the menu state from a string by expanding the ids in a list
  *
  * @param state is a SEPARATOR delimited String containing a list of ids to be expanded
  */
 function expandIds(state) {
 	
 	var splitted = state.split(SEPARATOR);
 	
 	for (i=0; i<splitted.length; i++) {
 		var id = splitted[i];
 		if (DEBUG) alert("Showing id: " + id);
 		showHide(id, SHOW);
 	}
 }
 
 /**
  * Extract the target from a string
  *
  * @return String that is after TARGET =
  */
 function extractTarget(string) {
 	var temp = new String(string);
 	var split = temp.split(TARGET + "=");
 	if (split.length < 2) return;
 	var split2 = split[split.length - 1].split("&");
 	return split2[0];
 }
 
  /**
  * Extract the menu state from a string
  *
  * @return String that is after MENUSTATE =
  */
 function extractMenuState(string) {
 	var temp = new String(string);
 	var split = temp.split(MENUSTATE + "=");
 	if (split.length < 2) return;
 	return split[split.length - 1];
 }
 
 
 /**********************************/
 /**          Utilities           **/
 
 /**
  * Change the language pattern inside an URL.
  * 
  * @param target: String holding the URL which will be 
  *       parsed and the language replaced by language
  * @param language: String holding the language code
  *		  in the form xx-XX, e.g. en-GB
  * @return String target with the language replaced
  */
 function changeLanguage(target, language) {
	 var re = /(.*-)[a-z]{2}(?:-[A-Z]{2})?(\.(?:html|pdf)(?:\?.+)?(?:#.*)?)$/;
	 var replaced = target.replace(re, "$1" + language + "$2");
	 if (DEBUG) alert(target + "\n" + replaced);
	 return replaced;
 }
 
 /** Remove the language from a URL.
  * 
  * @param target: String holding the URL which will be 
  *       parsed and the language removed
  * @return String target with the language replaced
  */
 function stripLanguage(target) {
	 var re = /(.*)-[a-z]{2}(?:-[A-Z]{2})?(\.(?:html|pdf)(?:\?.+)?(?:#.*)?)$/;
	 var replaced = target.replace(re, "$1$2");
	 if (DEBUG) alert(target + "\n" + replaced);
	 return replaced;
 }
 
 /**
  * Extract the language from a string
  * @return the language in xx-XX pattern, or null if there is no language match in the name
  */
 function getLanguage(value) {
 	var matches = value.match(/^.*-([a-z]{2}(?:-[A-Z]{2})?)\.(?:html|pdf)/);
 	if (matches)
 		return matches[1]; // 0, is the complete string
 	return; 
 }
