import style from "../styles/Table.module.css";
import TableRow from "./TableRow";
import { useAppContext } from "../context/context";
const Table = () => {
  const { lotteryPlayers } = useAppContext();
  var pls = [],
    plss = [],
    names = {};
  lotteryPlayers.forEach((item) => {
    names[item] = (names[item] || 0) + 1;
  });
  plss = Array.from(new Set(lotteryPlayers));
  for (var i = 0; i < plss.length; i++) {
    pls.push({ player: plss[i], amount: 5 * names[plss[i]] });
  }
  //console.log(pls);
  return (
    <div className={style.wrapper}>
      <div className={style.tableHeader}>
        <div className={style.addressTitle}>💳 User Address</div>
        <div className={style.amountTitle}>🪙 Amount</div>
      </div>
      <div className={style.rows}>
        {pls.length > 0 ? (
          pls.map((value, index) => <TableRow key={index} value={value} />)
        ) : (
          <div className={style.noPlayers}>No players yet</div>
        )}
      </div>
    </div>
  );
};
export default Table;
