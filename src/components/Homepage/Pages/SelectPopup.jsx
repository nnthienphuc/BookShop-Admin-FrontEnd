export default function SelectPopup({ open, title, rows, onSelect, onClose }) {
  if (!open) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => onSelect(item)}>Chọn</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}
