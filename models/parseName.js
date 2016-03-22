// file to parse human names in particular format
var humanname = require('humanparser');
var fs = require('fs');

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('/Users/Stephanie/Documents/workspace/readCSV/name file.txt')
});

lineReader.on('line', function (line) {
  var parsed = humanname.parseName(line);
  var title = parsed.saluation,
      firstName = parsed.firstName,
      middleName = parsed.middleName,
      lastName = parsed.lastName,
      suffix = parsed.suffix;

  if (title == null){
    title = 'NULL';
  }
  if (firstName == null){
    firstName = 'NULL';
  }
  if (middleName == null){
    middleName = 'NULL';
  }
  if (lastName == null) {
    lastName = 'NULL';
  }
  if (suffix == null) {
    suffix = 'NULL';
  }
  //console.log(parsed);
  //console.log(line + ' ' + title + ' ' + firstName + ' ' + middleName + ' ' + lastName + ' ' + suffix + "\n")
   fs.appendFileSync("out.txt",line + ',' + title + ',' + firstName + ',' + middleName + ',' + lastName + ',' + suffix + "\n");
});
