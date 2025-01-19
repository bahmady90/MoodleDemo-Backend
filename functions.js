export function getQuiz(questions) {
    if (questions.length < 20) {
        throw new Error("Not enough questions to generate a quiz of 20 items.");
    }

    const testData = [];
    const usedIds = new Set();

    while (testData.length < 20) {
        const randomNumber = Math.floor(Math.random() * questions.length);
        const randomRow = questions[randomNumber];
        const randomRowId = randomRow.id;

        if (!usedIds.has(randomRowId)) {
            testData.push(randomRow);
            usedIds.add(randomRowId);
        }
    }

    return testData;
}