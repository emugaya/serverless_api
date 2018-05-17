'use strict'

class Activities {
  constructor(dynamoDb, uuidv4) {
    this.dynamoDb = dynamoDb;
    this.uuidv4 = uuidv4
  }

  /**
   * Creates a new Project Activity
   * 
   * @param { string } workplanId - ID of workplan to which this project belongs to.
   * @param { object } activityDetail - Attributes of an activity
   * @param { object} responseObject - Response Object
   */
  creatActivity(workplanId, activityDetail, responseObject){
    const params = {
      TableName: 'AWP.Activities',
      Item: {
        WorkplanId: workplanId,
        ActivityId: this.uuidv4(),
        activityName: activityDetail.activityName,
        activityStartDate: activityDetail.activityStartDate,
        activityEndDate: activityDetail.activityEndDate,
        activityPlannedBudget: activityDetail.activityPlannedBudget,
        activityStatus: activityDetail.activityStatus,
        activityPartner: activityDetail.activityPartner,
        activityOwner: activityDetail.activityOwner,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    this.dynamoDb.put(params, (error, result) => {
      if (error) {
        const errorMessage = {
          message: 'Unable to create project',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      }

      if(result) {
        responseObject.json(params.Item);
      }
    })
  }

  /**
   * Gets a single activity
   * @param { string } workplanId - Workplan ID which this Workplan belongs to
   * @param { string } activityId - Activity ID of the workplan
   * @param { object } responseObject - Response Object
   */
  getActivity(workplanId, activityId, responseObject) {
    const params = {
      TableName: 'AWP.Activities',
      Key: {
        WorkplanId : workplanId,
        ActivityId : activityId
      },
      ReturnConsumedCapcity: 'TOTAL'
    }

    this.dynamoDb.get(params, (error, result) => {
      if (error) {
        const errorMessage = {
          message: 'An error occured while retrieving an activity',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      }

      if (result.Item) {
        responseObject.json(result.Item);
      } else {
        responseObject.status(404).json({message: 'Activity does not exist'});
      }
    });
  }

  /**
   * Retrieves all activities for particular workplan
   * 
   * @param { string } workplanId - Project Workplan to which activity belongs
   * @param { object } responseObject - Response Object
   */
  getActivities(workplanId, responseObject) {
    const params = {
      TableName: 'AWP.Activities',
      KeyConditionExpression: 'WorkplanId =:workplanId',
      ExpressionAttributeValues: {
        ':workplanId' : workplanId
      }
    }

    this.dynamoDb.query(params, (error, activities) =>{
      if (error) {
        const errorMessage = {
          message : 'An error occurred while retrieving activities',
          errorDetail : error
        }
        responseObject.status(400).json(errorMessage)
      }

      if (activities.Count > 0) {
        responseObject.json(activities);
      } else {
        responseObject.json({message: 'No activities are found'})
      }
    });
  }

  /**
   * Deletes a single activity plan
   * @param { string } workplanId 
   * @param { string } activityId 
   * @param { string } responseObject 
   */
  deleteActivity(workplanId, activityId, responseObject) {
    const params = {
      TableName: 'AWP.Activities',
      Key: {
        WorkplanId: workplanId,
        ActivityId: activityId
      },
      ReturnValues: 'ALL_OLD',
    }

    this.dynamoDb.delete(params, (error, result) => {
      if (error) {
        const errorMessage = {
          message: 'Unable to delete activity',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      } else if (result.Attributes) {
        responseObject.json({message: 'Activity deleted succesfully'});
      } else {
        responseObject.status(404).json({message: 'Activity does not exist'});
      }
    });
  }

  updateActivity(workplanId, activityId, activityUpdateDetail, responseObject) {
    const params = {
      TableName: 'AWP.Activities',
      Key: {
        WorkplanId: workplanId,
        ActivityId: activityId
      },
      UpdateExpression: 'set activityName =:an, activityStartDate =:as, activityEndDate =:ae, activityStatus =:asts, activityOwner =:ao, activityPartner =:ap',
      ExpressionAttributeValues: {
        ':an' : activityUpdateDetail.activityName,
        ':as' : activityUpdateDetail.activityStartDate,
        ':ae' : activityUpdateDetail.activityEndDate,
        ':asts' : activityUpdateDetail.activityStatus,
        ':ao' : activityUpdateDetail.activityOwner,
        ':ap' : activityUpdateDetail.activityPartner,
      },
      ReturnValues: 'ALL_NEW'
    }

    this.dynamoDb.update(params, (error, result) => {
      if (error) {
        const errorMessage = {
          message: 'An Error occured updating your activity',
          errorDetail: error
        }
        responseObject.status(400).json(errorMessage);
      }

      if (result.Attributes) {
        responseObject.json(result.Attributes);
      }
    })
  }
}

module.exports = Activities;
