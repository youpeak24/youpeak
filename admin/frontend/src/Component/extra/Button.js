const Button = (props) => {
  const {
    newClass,
    btnColor,
    btnName,
    onClick,
    style,
    btnIcon,
    disabled,
    type,
  } = props;

  return (
    <>
      <button
        className={`themeBtn text-center ${newClass} ${btnColor}`}
        onClick={onClick}
        disabled={disabled}
        type={type}
        style={style}
      >
        {btnIcon ? (
          <>
            {btnIcon} <span className="">{btnName}</span>
          </>
        ) : (
          btnName
        )}
      </button>
    </>
  );
};

export default Button;
