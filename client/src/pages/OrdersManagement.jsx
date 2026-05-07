import { useEffect, useState, useRef } from "react";
import { fetchOrders, createOrder, finalizeOrder } from "../services/orderService";
import API from "../api/axios"; 
import "../styles/Dashboard.css"; 
import "../styles/Checkout.css"; 
import io from "socket.io-client";
import PaymentQR from "../assets/qr-code.png"; 
import TableGrid from "../components/ui/TableGrid";
import { ShieldCheck, X } from "lucide-react";

const socket = io("http://localhost:5000");

export default function OrdersManagement({ user }) {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null); 
  const [paymentView, setPaymentView] = useState("summary");
  
  // 2-Step Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [typedCode, setTypedCode] = useState("");

  const branchId = user?.branchId || user?.branch?._id;
  const brandId = user?.brandId;
  const userId = user?._id;

  const loadData = async () => {
    if (!branchId) return;
    try {
      const [tablesRes, menuRes, ordersData] = await Promise.all([
        API.get(`/tables?branchId=${branchId}`), 
        API.get(`/menu?branchId=${branchId}`),
        fetchOrders(branchId)
      ]);
      setTables(tablesRes.data);
      setMenu(menuRes.data);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
    socket.emit("join-branch", branchId);
    
    socket.on("orderStatusUpdate", () => loadData());
    socket.on("tableStatusUpdate", (updatedTable) => {
        loadData();
        if (updatedTable.status === "bill_requested") {
            new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => {});
        }
    });
    socket.on("new-order", () => loadData());

    return () => {
        socket.off("orderStatusUpdate");
        socket.off("tableStatusUpdate");
        socket.off("new-order");
    };
  }, [branchId]);

  const handleTableClick = (tableId) => {
    setSelectedTable(tableId);
    const tableData = tables.find(t => t._id === tableId);
    if (tableData && tableData.currentOrderId) {
      const orderId = typeof tableData.currentOrderId === 'object' ? tableData.currentOrderId._id : tableData.currentOrderId;
      const foundOrder = orders.find(o => o._id === orderId);
      setActiveOrder(foundOrder || null);
    } else {
      const existingSession = orders.find(
        (o) => (o.tableId?._id === tableId || o.tableId === tableId) && o.status !== "completed"
      );
      setActiveOrder(existingSession || null);
    }
    setItems([]); 
  };

  const handleAddItem = (menuItem) => {
    if (!selectedTable) return alert("Please select a table first");
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === menuItem._id);
      if (existing) {
        return prev.map(i => i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  };

  const handleUpdateOrSave = async () => {
    if (!selectedTable || items.length === 0) return alert("Please select items first");
    try {
      if (activeOrder) {
        await API.put(`/orders/${activeOrder._id}/add-items`, { items });
      } else {
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        await createOrder({ 
            brandId, branchId, tableId: selectedTable, userId, items, 
            totalPrice: subtotal, orderType: "dine-in" 
        });
      }
      setItems([]); 
      loadData();
      alert("Success!");
    } catch (err) {
      alert("Error updating order.");
    }
  };

  const handleSendBillToCustomer = async () => {
    if (!activeOrder) return;
    try {
      const bill = calculateFinalBill(activeOrder);
      await API.post("/tables/send-bill", {
        orderId: activeOrder._id,
        userId: activeOrder.userId,
        billDetails: { ...bill, tableNumber: activeOrder.tableId?.tableNumber }
      });
      alert("Digital Receipt sent to customer's device.");
    } catch (err) {
      alert("Failed to send digital bill.");
    }
  };

  const handleProcessPayment = (method) => {
    if (method === 'QR' && paymentView === 'summary') {
        setPaymentView("qr");
        return;
    }
    setIsVerifying(true); // Open the verification code input screen
  };

  const handleFinalVerification = async () => {
    if (typedCode.length < 4) return alert("Please enter the 4-digit code from the customer's screen.");
    
    try {
      const tId = typeof activeOrder.tableId === 'object' ? activeOrder.tableId._id : activeOrder.tableId;

      // FIX: Ensure backend is ready for these parameters
      await API.post("/tables/release", { 
        tableId: tId, 
        orderId: activeOrder._id,
        paymentMethod: "Digital/QR"
      });

      // Reset State
      setShowCheckout(false);
      setIsVerifying(false);
      setTypedCode("");
      setActiveOrder(null);
      setSelectedTable("");
      loadData();
      alert("Payment Verified. Table is now Available.");
    } catch (err) { 
      console.error(err);
      alert("Verification failed. Please check backend logs."); 
    }
  };

  const calculateFinalBill = (order) => {
    if (!order) return { subtotal: 0, sc: 0, vat: 0, total: 0 };
    const subtotal = order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const sc = subtotal * 0.10; 
    const vat = (subtotal + sc) * 0.13; 
    const total = subtotal + sc + vat;
    return { 
      subtotal: subtotal.toFixed(2),
      sc: sc.toFixed(2), 
      vat: vat.toFixed(2), 
      total: total.toFixed(2) 
    };
  };

  if (loading) return <div className="luxury-loader">Synchronizing Floor Plan...</div>;

  return (
    <div className="dashboard-container luxury-bg">
      <div className="pos-header d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <div>
            <h1 className="gold-text m-0">POS Terminal</h1>
            <small className="text-muted">Branch: {user?.branchName}</small>
        </div>
        <div className="status-legend d-flex gap-3">
          <small><span className="dot bg-success"></span> Available</small>
          <small><span className="dot bg-danger"></span> Occupied</small>
          <small className="pulse-text"><span className="dot bg-warning"></span> Bill Requested</small>
        </div>
      </div>
      
      <div className="orders-mgmt-grid">
        <div className="left-pos-column">
          <div className="stat-card p-0" style={{ overflow: 'hidden' }}>
            <TableGrid tables={tables} selectedTable={selectedTable} onSelectTable={handleTableClick} />
          </div>
          <div className="stat-card mt-3">
            <h4 className="gold-text mb-3">Quick Menu</h4>
            <div className="responsive-menu-grid">
              {menu.map(m => (
                <div key={m._id} className="menu-pos-btn" onClick={() => handleAddItem(m)}>
                  <div className="btn-name">{m.name}</div>
                  <div className="btn-price">Rs. {m.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-pos-column" id="cart-section">
          <div className="stat-card cart-card d-flex flex-column" style={{ minHeight: '600px' }}>
            <div className="cart-header border-bottom pb-2">
                <h3 className="gold-text text-center m-0">
                    {activeOrder ? `Table ${activeOrder.tableId?.tableNumber || "Active"}` : "Select Table"}
                </h3>
                {activeOrder?.status === "bill_requested" && (
                    <div className="bill-request-badge">⚠️ PAYMENT REQUESTED</div>
                )}
            </div>
            
            <div className="cart-items-list scroll-list flex-grow-1 p-2">
              {activeOrder?.items.map((it, idx) => (
                <div key={idx} className="cart-row existing-item">
                  <span>{it.quantity}x {it.name}</span>
                  <span>Rs. {it.price * it.quantity}</span>
                </div>
              ))}
              {items.map(i => (
                <div key={i.menuItemId} className="cart-row new-item">
                  <span className="text-success">{i.quantity}x {i.name}</span>
                  <div className="d-flex align-items-center gap-2">
                    <span>Rs. {i.price * i.quantity}</span>
                    <button className="btn-remove" onClick={() => setItems(items.filter(x => x.menuItemId !== i.menuItemId))}>×</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-actions mt-auto border-top pt-3">
              <button className="gold-button w-100 py-3 mb-2" onClick={handleUpdateOrSave} disabled={!selectedTable || (items.length === 0 && !activeOrder)}>
                {activeOrder ? "UPDATE ORDER" : "START SESSION"}
              </button>
              {activeOrder && (
                <>
                  {activeOrder.status === 'bill_requested' && (
                    <button className="btn btn-outline-warning w-100 py-2 mb-2" onClick={handleSendBillToCustomer}>📤 SEND DIGITAL BILL</button>
                  )}
                  <button className={`settle-btn w-100 py-3 ${activeOrder.status === 'bill_requested' ? 'pulse-orange' : ''}`} 
                          onClick={() => { setPaymentView("summary"); setShowCheckout(true); setIsVerifying(false); }}>
                      💳 PROCESS SETTLEMENT
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCheckout && activeOrder && (
        <div className="pos-modal-overlay">
          <div className="pos-modal-content luxury-card" style={{ maxWidth: '450px' }}>
            {!isVerifying ? (
              <>
                <div className="text-center border-bottom mb-3 pb-2">
                    <h3 className="gold-text">GARDEN & CAFE</h3>
                    <small>Table: {activeOrder.tableId?.tableNumber}</small>
                </div>
                {paymentView === "summary" ? (
                    <div className="d-grid gap-2">
                        <div className="h4 text-center gold-text py-3">Total: Rs. {calculateFinalBill(activeOrder).total}</div>
                        <button className="btn btn-success py-3 font-weight-bold" onClick={() => handleProcessPayment('CASH')}>CASH</button>
                        <button className="btn btn-primary py-3 font-weight-bold" onClick={() => handleProcessPayment('QR')}>QR CODE</button>
                    </div>
                ) : (
                    <div className="text-center">
                        <h5 className="mb-3 text-white">Scan to Pay</h5>
                        <img src={PaymentQR} alt="QR" className="img-fluid border p-2 bg-white mb-3" style={{ maxWidth: '180px' }} />
                        <button className="gold-button w-100 py-3" onClick={() => handleProcessPayment('QR')}>PROCEED TO VERIFY</button>
                    </div>
                )}
                <button className="btn btn-link text-muted w-100 mt-2" onClick={() => setShowCheckout(false)}>Cancel</button>
              </>
            ) : (
              <div className="verification-screen text-center p-4">
                <ShieldCheck size={48} className="gold-text mb-3" />
                <h3 className="text-white">Enter Security Code</h3>
                <p className="text-muted small">Type the 4-digit code from the customer's phone to end the session.</p>
                <input 
                  type="text" 
                  className="form-control text-center my-4 luxury-input" 
                  style={{ fontSize: '2.5rem', letterSpacing: '10px', color: '#d4af37' }}
                  maxLength="4"
                  value={typedCode}
                  onChange={(e) => setTypedCode(e.target.value)}
                  placeholder="0000"
                />
                <button className="gold-button w-100 py-3 mb-2" onClick={handleFinalVerification}>VERIFY & CLOSE TABLE</button>
                <button className="btn btn-link text-muted" onClick={() => setIsVerifying(false)}>Back</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}