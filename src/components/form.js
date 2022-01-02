import { shortenAddress } from "../utils";

const Form = ({ proposals, isVoting, hasVoted, memberList, onSubmit }) => {
  return (
    <div className="member-page">
      <h1>Lastname DAO Member Dashboard</h1>
      <p>Congratulations on being a member</p>
      <div>
        <div>
          <h2>Member List</h2>
          <table className="card">
            <thead>
              <tr>
                <th>Address</th>
                <th>Token Amount</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((member) => {
                return (
                  <tr key={member.address}>
                    <td>{shortenAddress(member.address)}</td>
                    <td>{member.tokenAmount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Active Proposals</h2>
          <form onSubmit={onSubmit}>
            {proposals.map((proposal, index) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <div>
                  {proposal.votes.map((vote) => (
                    <div key={vote.type}>
                      <input
                        type="radio"
                        id={proposal.proposalId + "-" + vote.type}
                        name={proposal.proposalId}
                        value={vote.type}
                        //default the "abstain" vote to checked
                        defaultChecked={vote.type === 2}
                      />
                      <label htmlFor={proposal.proposalId + "-" + vote.type}>
                        {vote.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={isVoting || hasVoted} type="submit">
              {isVoting
                ? "Voting..."
                : hasVoted
                ? "You Already Voted"
                : "Submit Votes"}
            </button>
            <small>
              This will trigger multiple transactions that you will need to
              sign.
            </small>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form;
