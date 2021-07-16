import React, {ReactElement} from "react";
import ReactDOM from "react-dom";
import './index.css';

type SquareValue = ('X' | 'O' | null);
interface SquareProps {
  value: SquareValue;
  handleClick: () => void;
}

function Square(props: SquareProps) {
    const { value, handleClick } = props;

    return (
      <button className="square" onClick={handleClick}>
        {value}
      </button>
    );
}

interface BoardProps {
  squares: SquareValue[];
  handleClick: (i: number) => void;
}
interface BoardState {}

class Board extends React.Component<BoardProps, BoardState> {
  private renderSquare(i: number): ReactElement {
    const {squares, handleClick} = this.props;

    return <Square value={squares[i]} handleClick={() => handleClick(i)} />;
  }

  render() {
    return (
      <>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </>
    );
  }
}

interface GameProps {}
interface GameStep {
  squares: SquareValue[];
  isXNext: boolean;
  winner: SquareValue;
}
interface GameState {
  history: GameStep[];
  stepNumber: number;
}
class Game extends React.Component<GameProps, GameState> {
  constructor(props: Readonly<GameProps> | GameProps) {
    super(props);

    this.state = {
      history: [{
        squares: Array(9).fill(null),
        isXNext: true,
        winner: null,
      }],
      stepNumber: 0,
    }

    this.handleSquareClick = this.handleSquareClick.bind(this);
  }

  private static calculateWinner(squares: SquareValue[]): SquareValue {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  }

  private handleSquareClick(i: number): void {
    this.setState(prevState => {
      const { history, stepNumber: prevStepNumber } = prevState;
      const historyTillPreviousStep = history.slice(0, prevStepNumber + 1);
      const prevStep = historyTillPreviousStep[historyTillPreviousStep.length - 1];
      const squares = prevStep.squares.slice();
      if (squares[i] || prevStep.winner) {
        return prevState;
      }

      squares[i] = prevStep.isXNext ? 'X' : 'O';

      return {
        history: historyTillPreviousStep.concat([{
          squares: squares,
          isXNext: !prevStep.isXNext,
          winner: Game.calculateWinner(squares),
        }]),
        stepNumber: historyTillPreviousStep.length,
      }
    });
  }

  private jumpTo(stepNumber: number): void {
    this.setState({
      stepNumber: stepNumber,
    })
  }

  render() {
    const { history, stepNumber } = this.state;
    const step = history[stepNumber];
    const { squares, isXNext, winner } = step;

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else {
      status = `Next player: ${isXNext ? 'X' : 'O'}`;
    }

    const jumps = history.map((step, stepNumber) => {
      const description = `Go to ${stepNumber
        ? (step.winner ? 'Game Result' : 'step #' + stepNumber)
        : 'Game Start'}`;

      return (
        <li key={stepNumber}>
          <button type='button' onClick={() => this.jumpTo(stepNumber)}>{description}</button>
        </li>
      )
    });

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={squares} handleClick={this.handleSquareClick} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{jumps}</ol>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
