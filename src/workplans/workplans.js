class Workplans {
  constructor(dynamoDb, uuidv4){
    this.dynamoDb = dynamoDb;
    this.uuidv4 = uuidv4;
  }

  /**
   * Creates a new Project
   * @param { string } projectId  - Project ID to which this workplan belongs to
   * @param { object } workplanDetail - Detial of the workplan being created
   * @param { object } responseObject - Response Object
   */
  createWorkPlan(projectId, workplanDetail, responseObject) {
    const params = {
      TableName: 'AWP.Workplans',
      Item: {
        ProjectId: projectId,
        WorkplanId: this.uuidv4(),
        workplanName: workplanDetail.workplanName,
        workplanStartDate: workplanDetail.workplanStartDate,
        workplanEndDate: workplanDetail.workplanEndDate,
        createdAt: workplanDetail.createdAt,
        updatedAt: workplanDetail.updatedAt
      },
      ReturnValues: 'ALL_OLD',
    }

    this.dynamoDb.put(params, (error, workplan) => {
      if (error) {
        const errorMessage = {
          message: 'An Error occurred while creating this workplan',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      } else { 
        responseObject.json(params.Item);
      }
    });
  }

  /**
   * Gets a single work plan
   * @param { string } projectId  - Project ID the workplan belongs to
   * @param { string } workplanId - Workplan to be retirved
   * @param {string } responseObject - Response Object
   */
  getWorkplan(projectId, workplanId, responseObject) {
    const params = {
      TableName: 'AWP.Workplans',
      Key: {
        ProjectId : projectId,
        WorkplanId : workplanId
      },
      ReturnConsumedCapcity: 'TOTAL'
    }

    this.dynamoDb.get(params, (error, result) =>{
      if (error) {
        const errorMessage = {
          message: 'An error occurred while retrieving the workplan',
          errorDetail : error
        }
        responseObject.status(400).json(errorMessage);
      }

      if (result.Item) {
        responseObject.json(result.Item);
      } else {
        responseObject.status(404).json({message: 'Worplan not found'});
      }
    });
  }

  /**
   * Get Workplans for each per project
   * 
   * @param { string } projectId 
   * @param { object } responseObject 
   */
  getWorkPlans(projectId, responseObject) {
    const params = {
      TableName: 'AWP.Workplans',
      KeyConditionExpression: 'ProjectId =:projectId',
      ExpressionAttributeValues: {
        ':projectId' : projectId
      }
    }

    this.dynamoDb.query(params, (error, workplans) => {
      if (error){
        const errorMessage = {
          message : 'An error occured while retrieving this projects workplans',
          errorDetail : error
        }
        responseObject.status(400).json(errorMessage);
      }

      if (workplans.Count > 0) {
        responseObject.json(workplans);
      } else {
        responseObject.json({message: 'This project does not have any workplans'})
      }
    });
  }

  /**
   * Delete Workplan
   * 
   * @param { string } projectId  - Projects ID
   * @param { string } workplanId - Workplan's ID
   * @param { object } responseObject - Response object
   */
  deleteWorkplan(projectId, workplanId, responseObject) {
    const params = {
      TableName: 'AWP.Workplans',
      Key: {
        ProjectId: projectId,
        WorkplanId: workplanId
      },
      ReturnValues: 'ALL_OLD',
    }

    this.dynamoDb.delete(params, (error, results) => {
      if (error) {
        const errorMessage = {
          message: 'An Error occured while deleting this project',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      }

      if (results.Attributes) {
        responseObject.json({message: 'Workplan Deleted Succesfully'})
      } else {
        responseObject.status(404).json({message: 'Worplan does not exist'});
      }
    })
  }

  /**
   * Updates a workplan
   * @param { string } workplanId - Workplan ID 
   * @param { object } workPlanUpdateDetail - Name, StartDate, and EndDate details
   * @param { object } responseObject 
   */
  updateWorkplan(projectId, workplanId, workPlanUpdateDetail, responseObject){
    const params = {
      TableName: 'AWP.Workplans',
      Key: {
        ProjectId: projectId,
        WorkplanId: workplanId
      },
      UpdateExpression: 'set workplanName =:wp, workplanStartDate =:ws, workplanEndDate =:we, updatedAt =:ua',
      ExpressionAttributeValues: {
        ':wp': workPlanUpdateDetail.workplanName,
        ':ws': workPlanUpdateDetail.workplanStartDate,
        ':we': workPlanUpdateDetail.workplanEndDate,
        ':ua': workPlanUpdateDetail.updatedAt 
      },
      ReturnValues: 'ALL_NEW'
    }
    this.dynamoDb.update(params, (error, results) => {
      if (error) {
        const errorMessage = {
          message: 'Unable to update workplan',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      } else if (results) {
        responseObject.json(results.Attributes);
      } else {
        responseObject.status(404).json({message: 'Workplan does not exist'});
      }
    });
  }
}

module.exports = Workplans;
