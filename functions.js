export function getQuiz(questions){
    const testData = [];
    while(true){
        const randomNumber = Math.floor(Math.random() * questions.length);
        const randomRow = questions[randomNumber];
        const randomRowId = questions[randomNumber].id;
        if(!includesId(randomRowId, testData)){
          testData.push(randomRow);
          const indexToRemove = questions.findIndex((row) => row.id !== randomRowId);
          if(indexToRemove !== -1){
              questions.splice(indexToRemove, 1)
          }
        } 
    
        if(testData.length === 20){
          break;
        }
    
      }
  
      return testData;
  
      function includesId(randomRowId, testData){
          let includes = false;
          testData.forEach((row) => {
              if(row.id === randomRowId){
                  includes = true;
              }
          })
          return includes;
      }
  }