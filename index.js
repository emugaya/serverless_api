// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');
const Projects = require('./src/projects/projects');
const Workplans = require('./src/workplans/workplans');
const Activities = require('./src/activities/activities')

const USERS_TABLE = process.env.USERS_TABLE;

const IS_OFFLINE = process.env.IS_OFFLINE;
let dynamoDb;
if (IS_OFFLINE === 'true') {
  dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });
} else {
  dynamoDb = new AWS.DynamoDB.DocumentClient();
};

let projects = new Projects(dynamoDb, uuidv4);
let workplans = new Workplans(dynamoDb, uuidv4);
let activities = new Activities(dynamoDb, uuidv4);

app.use(bodyParser.json({ strict: false }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

//Get User Endpoint

app.get('/users/:userId', (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Could not get user' });
    }

    if (result) {
      const { userId, name } = result.Item;
      res.json({ userId, name });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
})

// Create User endpoint
app.post('/users', (req, res) => {
  const { userId, name } = req.body;
  if (typeof userId !== 'string') {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must ba a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      userId: userId,
      name: name,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create user' });
    }

    res.json({ userId, name });
  });
})

//post Project
app.post('/projects', (req, res) => { 
  projects.createProject(req.body, res);
});

/**
 * Retrieves All Projects
 */
app.get('/projects', (req, res) => {
  console.log(res);
  projects.getAllProjects(res);
});

/**
 * GetSingle project
*/
app.get('/projects/:projectId', (req, res) => {
  projects.getSingleProject(req.params.projectId, res);
})

/**
 * Update project
 */
app.patch('/projects/:projectId', (req, res) => {
  projects.updateProject(req, res);
});

/**
 * Delete Project
 */
app.delete('/projects/:projectId', (req, res) => {
  projects.deleteProject(req.params.projectId, res);
});

/**
 * Create Workplan
 */
app.post('/projects/:projectId/workplans', (req, res) => {
  workplans.createWorkPlan(req.params.projectId, req.body, res);
});

/**
 * Gets a single workplan
 */
app.get('/projects/:projectId/workplans/:workplanId', (req, res) => {
  workplans.getWorkplan(req.params.projectId, req.params.workplanId, res)  
});

/**
 * Retrieve Project specific Workplans
 */
app.get('/projects/:projectId/workplans', (req, res) => {
  workplans.getWorkPlansPerProject(req.params.projectId, res);
});

/**
 * Deletes Workplan
 */
app.delete('/projects/:projectId/workplans/:workplanId', (req, res) => {
  workplans.deleteWorkplan(req.params.projectId, req.params.workplanId, res);
});

/**
 * Updates Workplan
 */
app.patch('/projects/:projectId/workplans/:workplanId', (req, res) => {
  workplans.updateWorkplan(req.params.projectId,req.params.workplanId, req.body, res);
});

/**
 * Create Activity
 */
app.post('/workplans/:workplanId/activities', (req, res) =>{
  activities.creatActivity(req.params.workplanId, req.body, res);
})

/**
 * Gets a single activity
 */
app.get('/workplans/:workplanId/activities/:activityId', (req, res) => {
  activities.getActivity(req.params.workplanId,req.params.activityId,res);
})

/**
 * Gets all Activities for a particular workplan
 */
app.get('/workplans/:workplanId/activities', (req, res) => {
  activities.getActivities(req.params.workplanId, res);
})

/**
 * Updates a single activity
 */
app.patch('/workplans/:workplanId/activities/:activityId', (req, res) => {
  activities.updateActivity(req.params.workplanId, req.params.activityId, req.body, res);
})

/**
 * Delete Activity
 */
app.delete('/workplans/:workplanId/activities/:activityId', (req, res) => {
  activities.deleteActivity(req.params.workplanId, req.params.activityId, res);
})
module.exports.handler = serverless(app);
