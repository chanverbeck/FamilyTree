// A function to parse a GEDCOM file, the contents of which are passed in as a string in the only parameter gedcom.
// Returns an object with these properties:
// lines: total linecount of the file
// people: an array of person objects indexed as they are listed in the gedcom. Usually the indices start at 1.
// families: an array of family objects indexed as they are listed in the gedcom. Usually the indices start at 1.
//
// A person object contains the properties in the gedcom file. All of these are optional except index.
// index: the index in the file. This is the same as the index into the people field.
// name, birthdate, birthplace, deathdate, deathplace: obvious string values.
// gender: M or F.
// childOfFamily: contains an index into the families array.
// partentOfFamily: an array of numbers, each of which is an index into the families array.
//
// A family object contains the properties in the gedcom file. All of these are optional except index.
// index: the index in the file. This is the same as the index into the families field.
// marriagedate, marriageplace: obvious string values.
// husband, wife: indices into the people array.
// children: an array of numbers, each of which is an index into the people array.
module.exports = function parseGedcom(gedcom)
{
	var people = [];
	var families = [];
	
	var cur = 0;
	var lines = 0;
	var line;

	// getLine returns a line (either newline terminated or through the end of the string) from gedcom.
	// It uses cur to manage its progress. It keeps track of how many lines parsed, which is stored in
	// lines. When gedcom has been fully processed, it returns null.
	function getLine()
	{
		var line;
		var nlIndex;
		var crlfIndex;
		if (cur < gedcom.length)
		{
			line = gedcom.substr(cur);
			nlIndex = line.indexOf('\n');
			crlfIndex = line.indexOf('\r\n');
			if (nlIndex === -1) {
				// There is no new line -- get the rest of the file.
				cur += line.length;
			} else if (crlfIndex === -1 || crlfIndex > nlIndex) {
				// the new line comes before the carriage-return-line-feed, suck up to the newline and swallow it.
				line = line.substr(0, nlIndex);
				cur += nlIndex + 1;
			} else {
				// the crlf is closer than the nl (one closer, of course), suck up to the crlf and swallow it.
				line = line.substr(0, crlfIndex);
				cur += crlfIndex + 2;
			}
			
			lines += 1;

			return line;
		} else {
			return null;
		}
	}
	
	// peekLine returns a line (either newline terminated or through the end of the string) from gedcom,
	// but unlike getLine, it doesn't change cur, and therefore doesn't impact later calls to getLine.
	// When gedcom has been fully processed, it returns null.
	function peekLine()
	{
		var line;
		var nlIndex;
		var crlfIndex;
		if (cur < gedcom.length)
		{
			line = gedcom.substr(cur);
			nlIndex = line.indexOf('\n');
			crlfIndex = line.indexOf('\r\n');
			if (nlIndex === -1) {
				// There is no new line -- get the rest of the file.
			} else if (crlfIndex === -1 || crlfIndex > nlIndex) {
				// the new line comes before the carriage-return-line-feed, suck up to the newline.
				line = line.substr(0, nlIndex);
			} else {
				// the crlf is closer than the nl (one closer, of course), suck up to the crlf.
				line = line.substr(0, crlfIndex);
			}

			return line;
		} else {
			return null;
		}
	}

	// Parses a standard GEDCOM index (@I1234@), returning just the integer. It does very little 
	// checking.
	function parseIndex(s)
	{
		var iString;
		var index;
		iString = s.substr(2);
		iString = iString.substr(0, iString.length - 1);
		index = parseInt(iString);
		
		return index;
	}
	
	// Parses an event and returns an object containing a date and place property. It assumes the event
	// is at level 2 in the GEDCOM file.
	function parseEvent()
	{
		var line;
		var peekedLine;
		var event = {};
		var value;

		peekedLine = peekLine();
		for (; peekedLine != null && peekedLine.substr(0, 2) !== '0 ' && peekedLine.substr(0, 2) !== '1 '; ) {
			line = getLine();
			if (line.substr(0, 2) === '2 ') {
				if (line.substr(0, 6) === '2 DATE') {
					value = line.substr(7);
					
					event.date = value;
				} else if (line.substr(0, 6) === '2 PLAC') {
					value = line.substr(7);
					
					event.place = value;
				} else {
				}
			} else {
			}
			peekedLine = peekLine();
		}
		
		return event;
	}
	
	// Parses a person into a object object described above. It assume the person is at level
	// 1 in the GEDCOM file.
	// Note that it assumes that some facts may be listed multiple times in the gedcom file, and
	// the first one is assumed to be "Preferred" and is put in the "person." These facts are NAME,
	// BIRT, DEAT, and FAMC (Child of family). Others may appear multple times, such as FAMS 
	// (parent of family) because people may have multiple spouses, and therefore multiple families.
    // It is assumed to be an error if SEX is listed multiple times.
	function parsePerson()
	{
		var line;
		var peekedLine;
		var person = {};
		var value;

		peekedLine = peekLine();
		for (; peekedLine != null && peekedLine.substr(0, 2) !== '0 '; ) {
			line = getLine();
			if (line.substr(0, 2) === '1 ') {
				if (line.substr(0, 6) === '1 NAME') {
					value = line.substr(7);
					
					if (!person.name) {
						person.name = value;
					}
				} else if (line.substr(0, 5) === '1 SEX') {
					value = line.substr(6);

					if (person.gender) {
					    alert("Gender specified multiple times: " + person.name);
					}
					person.gender = value;
				} else if (line.substr(0, 6) === '1 FAMS') {
					value = line.substr(7);
					
					if (!person.parentOfFamily) {
						person.parentOfFamily = [];
					}
					person.parentOfFamily.push(parseIndex(value));
				} else if (line.substr(0, 6) === '1 FAMC') {
					value = line.substr(7);

					if (!person.childOfFamily) {
					    person.childOfFamily = parseIndex(value);
					}
				} else if (line.substr(0, 6) === '1 BIRT') {
					value = parseEvent();
					
					if (!person.birthdate && value.date) {
						person.birthdate = value.date;
					}
		            if (!person.birthplace && value.place) {
						person.birthplace = value.place;
					}
				} else if (line.substr(0, 6) === '1 DEAT') {
					value = parseEvent();

					if (!person.deathdate && value.date) {
						person.deathdate = value.date;
					}
					if (!person.deathplace && value.place) {
						person.deathplace = value.place;
					}
				} else {
				}
			} else {
			}
			peekedLine = peekLine();
		}
		
		return person;
	}
	
	// Parses a family into a object object described above. It assume the family is at level
	// 1 in the GEDCOM file.
	function parseFamily()
	{
		var family = {};

		var line;
		var peekedLine;
		var value;

		peekedLine = peekLine();
		for (; peekedLine != null && peekedLine.substr(0, 2) !== '0 '; ) {
			line = getLine();
			if (line.substr(0, 2) === '1 ') {
				if (line.substr(0, 6) === '1 HUSB') {
					value = line.substr(7);
					
					family.husband = parseIndex(value);
				} else if (line.substr(0, 6) === '1 WIFE') {
					value = line.substr(7);
					
					family.wife = parseIndex(value);
				} else if (line.substr(0, 6) === '1 CHIL') {
					value = line.substr(7);
					if (!family.children) {
						family.children = [];
					}
					family.children.push(parseIndex(value));
				} else if (line.substr(0, 6) === '1 MARR') {
					value = parseEvent();
					
					if (value.date) {
						family.marriagedate = value.date;
					}
					if (value.place) {
						family.marriageplace = value.place;
					}
				} else {
				}
			} else {
			}
			peekedLine = peekLine();
		}

		return family;
	}
	
	var person;
	var family;
	var index;

	for (; (line = getLine()) != null; ) {
		if (line.substr(0, 2) === '0 ')
		{
			var elements  = line.split(' ');
			if (elements[1] === 'HEAD') {
				// Head section
			} else if (elements[1] === 'TRLR') {
				// Trailer section
			} else if (elements[2] === 'INDI') {
				// A person with the index elements[1]
				index = parseIndex(elements[1]);
				
				person = parsePerson();
				person.index = index;
				people[index] = person;
			} else if (elements[2] === 'FAM') {
				index = parseIndex(elements[1]);
				
				family = parseFamily();
				family.index = index;
				families[index] = family;
			} else if (elements[2] == 'SUBM') {
				// ignore SUBM.
			} else if (elements[2] == 'NOTE') {
				// ignore
			} else if (elements[2] == 'SOUR') {
				// ignore sources
			} else if (elements[2] == 'REPO') {
			} else {
			}

		}
	}
	
	return { people: people, families: families, lines: lines };
}
