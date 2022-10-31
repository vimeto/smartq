import { useEffect, useState } from "react";
import ReactSlider from "react-slider";
import styles from '../styles/Modal.module.css';
// import '../styles/Modal.module.css';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
  handleQueueUpdate: (val: number) => void;
  restaurantName: string;
}

const Modal: React.FC<ModalProps> = (
  { open, handleClose, handleQueueUpdate, restaurantName }
) => {
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' }

    return () => { document.body.style.overflow = 'unset'; }
  }, [open])

  const handleCancel = () => handleClose();

  const handleSubmit = () => {
    handleQueueUpdate(sliderValue);
    setSliderValue(0);
  }

  return (
    <div className={`w-screen h-screen fixed top-0 left-0 bg-gray-700 bg-opacity-50 ${!open && 'hidden'}`}>
      <div className="bg-white fixed top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 w-10/12 max-w-md rounded-xl">
        <div className="">
          <div className="p-2 mx-2 text-xl border-b text-center">
            Update queue length for {restaurantName}
          </div>
          <div style={{ padding: '1rem 0 calc(22px + 1rem) 0' }}>
            <ReactSlider
              className={styles.customSlider}
              trackClassName={styles['customSlider-track']}
              thumbClassName={styles['customSlider-thumb']}
              renderTrack={(props, state) => (
                state.index === 0 ? (
                  <div
                    className={styles['customSlider-track-0']}
                    key={props.key}
                    style={props.style}
                    />
                  ) : <div {...props} />
                )}
                min={0}
                max={60}
                step={5}
                renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                value={sliderValue}
                onChange={(value,) => { setSliderValue(value) }}
              />
          </div>
          <div className="flex flex-row">
            <div className="cursor-pointer w-6/12 text-center p-2 bg-gray-200 font-bold rounded-bl-xl" onClick={handleCancel}>Cancel</div>
            <div className="cursor-pointer w-6/12 text-center p-2 bg-green-400 text-white font-bold rounded-br-xl" onClick={handleSubmit}>Update</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal;
