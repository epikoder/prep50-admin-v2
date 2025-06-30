import {
  Component,
  createRef,
  forwardRef,
  Fragment,
  ReactNode,
  SelectHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import Input from "./Input";
import { postgrest, WithAuth } from "@src/utils/postgrest";
import { tagTitle } from "@src/utils/helper";
import { ActivityIndicator } from "./Icons";

interface MultiSelectProp<T>
  extends Omit<React.HTMLAttributes<HTMLInputElement>, "value" | "multiple"> {
  name: string;
  label?: string;
  disabled?: boolean;
  items: T[];
  defaultValues?: string[];
  helperText?: string;
  render?: (v: T) => ReactNode;
}

export type MultiSelectItem = ID & Disabled & { [k: string]: any };
export const MultiSelect = forwardRef(
  (
    {
      name,
      items,
      render,
      label,
      helperText,
      disabled,
      defaultValues,
    }: MultiSelectProp<MultiSelectItem>,
    ref,
  ) => {
    useImperativeHandle(ref, () => ({
      getSelectedItems: () => state,
    }));
    const [state, setState] = useState<Set<string>>(new Set(defaultValues));
    const _isSelected = (v: MultiSelectItem) => state.has(v.getID());

    const onTap = (v: MultiSelectItem) => {
      const newSet = new Set(state);
      if (newSet.has(v.getID())) {
        newSet.delete(v.getID());
      } else {
        newSet.add(v.getID());
      }
      setState(newSet);
    };

    return (
      <div>
        <div className={"font-[500] flex items-center gap-4"}>
          {label && <span>{label}</span>}
          {helperText && (
            <em className={"text-xs text-zinc-500 flex items-center gap-1"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{helperText}</span>
            </em>
          )}
        </div>
        <div className={"flex flex-wrap gap-3"}>
          {items.map((v) => (
            <div
              key={v.getID()}
              className={`w-fit px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-zinc-300 aria-disabled:bg-zinc-600 aria-disabled:hover:bg-zinc-600 aria-disabled:text-white aria-disabled:cursor-not-allowed ${
                _isSelected(v)
                  ? "border-2 border-green-500"
                  : "border border-gray-400"
              }`}
              id={name + "." + v.getID()}
              onClick={disabled || v.disabled ? undefined : () => onTap(v)}
              aria-disabled={disabled || v.disabled}
            >
              {render ? render(v) : String(v)}
            </div>
          ))}
          {items.length == 0 && (
            <div className={"whitespace-nowrap text-sm"}>
              - - No items available - -
            </div>
          )}
        </div>
      </div>
    );
  },
);

export interface SelectorAttibutes<T> {
  options: T[];
  defaultValue?: T;
  placeholder?: string;
  isLoading?: boolean;
  toString(v: T): string;
  render?: (_: T) => ReactNode;
  onOptionSelected(v: T): void;
}

export interface SelectorState {
  visible: boolean;
  value: string;
  is_focused: boolean;
}

export class Selector<T> extends Component<
  SelectorAttibutes<T>,
  SelectorState
> {
  public state: SelectorState = {
    visible: false,
    value: "",
    is_focused: false,
  };

  private styleVisible = { display: "block" };
  private styleHidden = { display: "none" };
  private clickHandler = (e: Event) => this.onClickOutside(e);
  private ref = createRef<HTMLInputElement>();
  private _ref = createRef<HTMLDivElement>();

  constructor(props: SelectorAttibutes<T>) {
    super(props);
    this.checkMatch = this.checkMatch.bind(this);
    this.closeTooltip = this.closeTooltip.bind(this);
    this.onClickOutside = this.onClickOutside.bind(this);
    this.onFocusHandler = this.onFocusHandler.bind(this);
    this.filterOptions = this.filterOptions.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.getMatcher = this.getMatcher.bind(this);
    this.selectOption = this.selectOption.bind(this);
    this.explicitSelection = this.explicitSelection.bind(this);
    this.enableFilter = this.enableFilter.bind(this);
  }

  public componentDidMount(): void {
    if (this.props.defaultValue) {
      this.setState(() => ({
        value: this.props.toString(this.props.defaultValue!),
      }));
    }
  }

  private onClickOutside(e: Event): void {
    !this._ref.current?.contains(e.target as Node) && this.closeTooltip();
  }

  private closeTooltip(opt?: T): void {
    this.setState(() => ({ visible: false }));
    globalThis.removeEventListener("click", this.clickHandler);
    if (opt) this.checkMatch(opt);
  }

  private checkMatch(opt: T): void {
    const match = this.props.options.find((v) => this.getMatcher(opt, v));
    if (!match) return;
    this.selectOption(match);
  }

  private getMatcher(opt: T, compare: T): boolean {
    return (
      this.props
        .toString(opt)
        .match(
          new RegExp(
            `^${
              this.props
                .toString(compare)
                .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            }$`,
            "i",
          ),
        ) != null
    );
  }

  private onFocusHandler(e: React.FocusEvent<HTMLInputElement>): void {
    (e.target as HTMLInputElement).select();
    this.setState(() => ({ visible: true, is_focused: true }));
    globalThis.addEventListener("click", this.clickHandler);
  }

  private filterOptions(e: React.FormEvent<HTMLInputElement>): void {
    const { value } = e.target as HTMLInputElement;
    this.setState(() => ({ value }));
  }

  private applyFilter(opt: T): boolean {
    return (
      this.props.toString(opt).match(new RegExp(this.state.value, "i")) != null
    );
  }

  private selectOption(opt: T): void {
    this.props.onOptionSelected(opt);
  }

  private explicitSelection(opt: T): void {
    this.setState(() => ({ value: this.props.toString(opt) }));
    this.closeTooltip(opt);
  }

  private enableFilter(e: React.KeyboardEvent<HTMLInputElement>) {
    const el = e.target as HTMLInputElement;
    this.setState({ is_focused: false });
  }

  private loader = (
    <div className={"flex justify-center"}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 animate-spin"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </div>
  );

  public render() {
    return this.props.isLoading
      ? (
        this.loader
      )
      : (
        <div ref={this._ref} data-selector-container>
          <div data-selector-display>
            <input
              onFocus={this.onFocusHandler}
              onInput={this.filterOptions}
              value={this.state.value}
              placeholder={this.props.placeholder}
              className={"min-w-sm w-full border rounded p-1"}
              ref={this.ref}
              onKeyUp={this.enableFilter}
            />
          </div>
          <div
            data-selector-tooltip
            style={{
              ...(this.state.visible ? this.styleVisible : this.styleHidden),
              width: this.ref.current
                ? `${this.ref.current!.getBoundingClientRect().width}px`
                : "",
            }}
            className={"absolute max-h-[60vh] overflow-y-scroll border rounded p-2 bg-white"}
          >
            {this.props.options
              .filter(
                (opt) =>
                  this.state.is_focused ||
                  !this.state.value ||
                  this.applyFilter(opt),
              )
              .map((opt) => (
                <div
                  key={this.props.toString(opt)}
                  data-selector-option
                  onClick={() => this.explicitSelection(opt)}
                  className={"px-1"}
                >
                  <span>
                    {this.props.render
                      ? this.props.render(opt)
                      : this.props.toString(opt)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      );
  }
}

export const SelectMonth = (
  { defaultValue, onChange }: Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    "defaultValue" | "onChange"
  >,
) => (
  <select
    defaultValue={defaultValue}
    onChange={onChange}
    className="outline-none"
  >
    <option value={0}>
      January
    </option>
    <option value={1}>
      Feb
    </option>
    <option value={2}>
      March
    </option>
    <option value={3}>
      April
    </option>
    <option value={4}>
      May
    </option>
    <option value={5}>
      June
    </option>
    <option value={6}>
      July
    </option>
    <option value={7}>
      August
    </option>
    <option value={8}>
      September
    </option>
    <option value={9}>
      October
    </option>
    <option value={10}>
      November
    </option>
    <option value={11}>
      December
    </option>
  </select>
);

export const SelectTag = ({ defaultValue, onChange }: Pick<
  SelectHTMLAttributes<HTMLSelectElement>,
  "defaultValue" | "onChange"
>) => {
  return (
    <select
      defaultValue={defaultValue}
      onChange={onChange}
      className="outline-none border border-zinc-300"
    >
      {(["J", "W", "JW"] as Tag[]).map((v) => (
        <option value={v} key={v}>{tagTitle(v)}</option>
      ))}
    </select>
  );
};

export const SelectSubject = ({ defaultValue, onChange }: Pick<
  SelectHTMLAttributes<HTMLSelectElement>,
  "defaultValue" | "onChange"
>) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new WithAuth(postgrest.from("subjects").select()).unwrap().then(
      ({ data, error }) => {
        setLoading(false);
        if (error) return;
        setSubjects(data);
      },
    );
  }, []);

  return (
    loading ? <ActivityIndicator active /> : (
      <select
        defaultValue={defaultValue}
        onChange={onChange}
        className="outline-none border border-zinc-300"
      >
        {subjects.map((v) => <option value={v.id} key={v.id}>{v.name}</option>)}
      </select>
    )
  );
};

export const SelectTopic = ({ defaultValue, onChange, subject_id }:
  & Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    "defaultValue" | "onChange"
  >
  & { subject_id: any }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new WithAuth(postgrest.from("topics").select().eq("subject_id", subject_id))
      .unwrap().then(
        ({ data, error }) => {
          setLoading(false);
          if (error) return;
          setTopics(data);
        },
      );
  }, [subject_id]);

  return (
    loading ? <ActivityIndicator active /> : (
      <select
        defaultValue={defaultValue}
        onChange={onChange}
        className="outline-none border border-zinc-300"
      >
        {topics.map((v) => (
          <option
            value={v.id}
            key={v.id}
            dangerouslySetInnerHTML={{ __html: v.title }}
          />
        ))}
      </select>
    )
  );
};

export const SelectObjective = ({ defaultValue, onChange, topic_id }:
  & Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    "defaultValue" | "onChange"
  >
  & { topic_id: any }) => {
  const [objectives, setObjectives] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new WithAuth(
      postgrest.from("objectives_view").select().eq("topic_id", topic_id),
    )
      .unwrap().then(
        ({ data, error }) => {
          setLoading(false);
          if (error) return;
          setObjectives(data);
        },
      );
  }, [topic_id]);

  return (
    loading ? <ActivityIndicator active /> : (
      <select
        defaultValue={defaultValue}
        onChange={onChange}
        className="outline-none border border-zinc-300"
      >
        {objectives.map((v) => (
          <option
            value={v.id}
            key={v.id}
            dangerouslySetInnerHTML={{ __html: v.title }}
          />
        ))}
      </select>
    )
  );
};
