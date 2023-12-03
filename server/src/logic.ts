
const boardSize = 15;

// 연속된 돌이 5개인지 확인하는 함수
const hasConsecutiveStones = (board: string[], target: string, consecutiveCount: number): boolean => {
    let count = 0;
    for (const stone of board) {
        if (stone === target) {
        count++;
        if (count === consecutiveCount) {
            return true;
        }
        } else {
        count = 0;
        }
    }
    return false;
};

// 수평, 수직, 대각선 방향으로 연속된 돌이 5개인지 확인하는 함수
export const hasWinningMove = (board: string[][], target: string, consecutiveCount: number): boolean => {

    // 수평 확인
    for (let i = 0; i < boardSize; i++) {
        if (hasConsecutiveStones(board[i], target, consecutiveCount)) {
        return true;
        }
    }

    // 수직 확인
    for (let j = 0; j < boardSize; j++) {
        const column = board.map(row => row[j]);
        if (hasConsecutiveStones(column, target, consecutiveCount)) {
        return true;
        }
    }

    // 우상향 대각선 확인
    for (let i = 0; i <= boardSize - consecutiveCount; i++) {
        for (let j = 0; j <= boardSize - consecutiveCount; j++) {
            const diagonal = [];
            for (let k = 0; k < consecutiveCount; k++) {
                diagonal.push(board[i + k][j + k]);
            }
            if (hasConsecutiveStones(diagonal, target, consecutiveCount)) {
                return true;
            }
        }
    }

    // 우하향 대각선 확인
    for (let i = 0; i <= boardSize - consecutiveCount; i++) {
        for (let j = consecutiveCount - 1; j < boardSize; j++) {
            const diagonal = [];
            for (let k = 0; k < consecutiveCount; k++) {
                diagonal.push(board[i + k][j - k]);
            }
            if (hasConsecutiveStones(diagonal, target, consecutiveCount)) {
                return true;
            }
        }
    }

    return false;
};