import {
  formatCurrency,
  formatTransactionType,
  type StudentProfile,
} from "../api";

interface Props {
  student: StudentProfile;
}

export function IncomePanel({ student }: Props) {
  return (
    <section className="panel income-panel">
      <div className="panel-header">
        <h2>My income</h2>
        <p className="muted">{student.class?.name ?? "Your class"}</p>
      </div>

      <div className="balance-card">
        <span className="balance-label">Current balance</span>
        <span className="balance-amount">{formatCurrency(student.balance)}</span>
        <span className="balance-unit">class coins</span>
      </div>

      <div className="transactions">
        <h3>Recent activity</h3>
        {student.recentTransactions.length === 0 ? (
          <p className="muted empty-state">No transactions yet.</p>
        ) : (
          <ul className="transaction-list">
            {student.recentTransactions.map((tx) => (
              <li key={tx.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-desc">
                    {tx.description ?? formatTransactionType(tx.type)}
                  </span>
                  <span className="transaction-type muted">
                    {formatTransactionType(tx.type)}
                  </span>
                </div>
                <span className={`transaction-amount${tx.amount < 0 ? " negative" : ""}`}>
                  {tx.amount > 0 ? "+" : ""}
                  {formatCurrency(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
