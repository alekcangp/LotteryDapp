import style from "../styles/TableRow.module.css";
import truncateEthAddress from "truncate-eth-address";
const TableRow = ({ value }) => {
  return (
    <div className={style.wrapper}>
      <div className={style.address}>{truncateEthAddress(value.player)}</div>
      <div className={style.ethAmount}>
        <span className={style.goldAccent}>{value.amount} WBGL</span>
      </div>
    </div>
  );
};
export default TableRow;
