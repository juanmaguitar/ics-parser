const path = require('path');
const parseFile = require('./parseIcs');

parseFile(path.join(__dirname, '/data/descarga.ics'), (data) => {
  const filterWithTags = ({ details: { tags } }) => !tags.endsWith('ninguna');
  const filterSomedayTasks = ({ details: { tags } }) => tags.includes('@someday');
  const filtered = data.filter(filterWithTags).filter(filterSomedayTasks);
  const summaries = filtered.map(task => [task.summary.toUpperCase(), task.details.tags]);

  console.log(summaries);
  console.log(`Filtered ${filtered.length} from ${data.length} tasks...`);
});
