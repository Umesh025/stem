export const generateMathProblem = () => {
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1: number, num2: number;
  
    if (operation === '+') {
      num1 = Math.floor(Math.random() * 5) + 1;
      num2 = Math.floor(Math.random() * (9 - num1)) + 1;
    } else {
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * num1);
    }
  
    const answer = operation === '+' ? num1 + num2 : num1 - num2;
    const question = `${num1} ${operation} ${num2}`;
  
    return { question, answer };
  };