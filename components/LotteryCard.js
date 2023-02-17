import style from "../styles/PotCard.module.css";
import truncateEthAddress from "truncate-eth-address";
import { useAppContext } from "../context/context";

const LotteryCard = () => {
  // TODO: Get the data needed from context
  const {
    enterLottery,
    lotteryPot,
    lotteryId,
    pickWinner,
    lastWinner,
    address,
    owner,
    wait,
  } = useAppContext();
  return (
    <div className={style.wrapper}>
      <div className={style.title}>
        {/* TODO: Dynamically render the lotteryID */}
        Lottery{" "}
        <span className={style.textAccent}>#{lotteryId ? lotteryId : "0"}</span>
      </div>
      <div className={style.pot}>
        {/* TODO: Dynamically render the lottery pot */}
        Prize 💰: <span className={style.goldAccent}>{lotteryPot}</span>
      </div>

      <div className={style.recentWinnerTitle}>🏆 Last Winner 🏆</div>
      <div className={style.winner}>
        {/* TODO: Dynamically render the last winner */}
        {!lastWinner.length ? (
          <div className={style.winner}>No winner yet</div>
        ) : (
          lastWinner.length > 0 && (
            <div className={style.winner}>
              {truncateEthAddress(lastWinner[lastWinner.length - 1])}
            </div>
          )
        )}
      </div>
      {/* TODO: Add onClick functionality to the buttons */}
      {address !== owner && !wait ? (
        <div className={style.btn} onClick={enterLottery}>
          Enter{" "}
        </div>
      ) : (
        <div></div>
      )}

      {address === owner && !wait ? (
        <div className={style.btn} onClick={pickWinner}>
          Pick Winner
        </div>
      ) : (
        <div></div>
      )}
      {wait == true ? (
        <div className={style.btn}>Processing...</div>
      ) : (
        <div></div>
      )}
    </div>
  );
};
export default LotteryCard;
