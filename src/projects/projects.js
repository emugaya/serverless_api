
class Projects {
  constructor(dynamoDb, uuidv4){
    this.dynamoDb = dynamoDb;
    this.uuidv4 = uuidv4;
  }

  /**
   * Creates a new Project
   * 
   * @param { objeect } requestData Details of project to be created
   * @param { object } responseObject Response object
   */
  createProject(requestData, responseObject) {
    var date = new Date();
    const params = {
      "TableName": "AWP.Projects",
      "Item": {
        ProjectId: this.uuidv4(),
        projectName: requestData.projectName,
        projectLocation: requestData.location,
        projectOwner: requestData.projectOwner,
        projectBudget: 100000000,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        createdAt: requestData.createdAt,
        updateAt: requestData.updateAt
      }
    };

    this.dynamoDb.put(params, (err, data) => {
      if (err) {
        responseObject.status(400).json({ error: 'could not create project' });
      }
  
      if (data) {
        responseObject.json(params.Item);
      }
    });
  }

  /**
   * Retrieves a single project
   * 
   * @param { string } projectId ID of project to be retrieved
   * @param { object } responseObject Response object
   */
  getSingleProject(projectId, responseObject) {
    const params = {
      TableName: 'AWP.Projects',
      Key: {
        ProjectId: projectId
      },
      ReturnConsumedCapacity: 'TOTAL',
    }

    this.dynamoDb.get(params, (error, results) => {
      if (error) {
        responseObject.status(400).json({error: 'Could not get project'})
      }
      if (results.Item){
        responseObject.json(results.Item);
      } else {
        responseObject.status(404).json({ error: 'Project not found'});
      }
    })
  }

  /**
   * Deletes a project
   * @param { string } projectId  - Project unique identifier
   * @param { object } responseObject  - Response object
   */
  deleteProject(projectId, responseObject){
    const params = {
      TableName: 'AWP.Projects',
      Key: {
        ProjectId: projectId
      },
      ReturnValues: 'ALL_OLD',
    }
  
    this.dynamoDb.delete(params, (error, results) => {
      if (error) {
        responseObject.status(400).json({errorMessage : error });
      } else if(results.Attributes) {
        responseObject.json({message : 'Project deleted succesfully'});
      } else {
        responseObject.status(404).json({errorMessage: 'Project not found'})
      }
    })
  }

  //TODO Complete Update method
  /**
   * Update Project
   * 
   * @param { object } request 
   * @param { object } responseObject 
   */
  updateProject(request, responseObject){
    const params = {
      TableName: 'AWP.Projects',
      Key: {
        ProjectId: request.params.projectId
      },
      UpdateExpression: 'set projectName =:pn, projectLocation =:pl, projectOwner =:po, projectBudget =:pb, startDate =:sd, endDate =:ed, updateAt =:ua',
      ExpressionAttributeValues: {
        ':pn': request.body.projectName,
        ':pl': request.body.projectLocation,
        ':po': request.body.projectOwner,
        ':pb': request.body.projectBudget,
        ':sd': request.body.startDate,
        ':ed': request.body.endDate,
        ':ua': '1996-12-17T03:24:00'
      },
      ReturnValues: 'ALL_NEW',
      ReturnConsumedCapacity: 'TOTAL',
      ReturnItemCollectionMetrics: 'SIZE'
    }
  
    this.dynamoDb.update(params, (error, result) => {
      if (error) {
        console.log(error);
        responseObject.status(400).json({error: 'Could not update project'});
      } else if (result.Attributes) {
        responseObject.json(result.Attributes)
      } else {
        responseObject.status(404).json({ error: 'Project not found'});
      }
    });
  }

  /**
   * Retrieves all projects from
   * 
   * @param { object } responseObject 
   */
  getAllProjects(responseObject){
    const params = {
      TableName: 'AWP.Projects'
    }

    this.dynamoDb.scan(params, (error, projects) => {
      if (error) {
        const errorMessage = {
          message : 'An error occurred while retriving projects',
          errorDetail : error
        }
        responseObject.status(400).json(errorMessage);
      }

      if(projects) {
        responseObject.json(projects);
      }
    })
  }
}

module.exports = Projects;
