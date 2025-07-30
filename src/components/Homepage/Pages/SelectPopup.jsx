import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";

export default function SelectPopup({ open, title, rows, onSelect, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>
                  <Button onClick={() => onSelect(item)}>Chọn</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <DialogFooter>
          <Button onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
