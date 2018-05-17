'use strict'

class Tasks {
  constructor(dynamoDb, uuidv4) {
    this.dynamoDb = dynamoDb;
    this.uuidv4 = uuidv4;
  }

  createTask(workplanId, activityId, responseObject) {
    const params = {
      TableName: 'AWP.Activities',
      Key:{
        WorkplanId: workplanId,
        ActivityId: activityId
      },
      
    }
  }
}