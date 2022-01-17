import classNames from 'classnames';
import { Dropdown } from 'primereact/dropdown';

function LangButton(props) {
    const languages = ["LV", "RU", "EN"];
    const lang = "LV";

    const className = classNames(props.className, "App-Header-langbutton")
    return (
        <Dropdown value={lang} options={languages} className={className} />
    );
}

export default LangButton;