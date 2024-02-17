const TimelineObject = ({ obj }) => {
    const style = {
        left: `calc(${obj.start}px * var(--tl-x-scale))`,
        top: `calc(${obj.layer} * (30px * var(--tl-y-scale) + 5px))`,
        width: `calc(${obj.len - 0.1}px * var(--tl-x-scale) - 4px)`,
        backgroundColor: obj.func.color(...obj.args),
        color: obj.func.textcolor(...obj.args),
    };

    return (
        <div className="object" style={style}>
            {obj.func.text(...obj.args)}
        </div>
    );
};
export default TimelineObject;