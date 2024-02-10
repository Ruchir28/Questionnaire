import React from "react";
interface QuestionProps {
  questionText: string;
  id: string;
  upvotes: number;
  onUpvote: () => void;
}

function Question(props: QuestionProps) {
  return (
    <div className="container text-center mb-3">
      <div className="row">
        <div className="col-7 text-wrap">
          <h5>{props.questionText}</h5>
        </div>
        <div className="col-4">
          <button className="btn btn-outline-success me-2" onClick={props.onUpvote}>Upvote</button>
          <button className="btn btn-warning">{props.upvotes}</button>
        </div>
      </div>
    </div>
  );
}

export default Question;
