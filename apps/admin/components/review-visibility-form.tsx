import { toggleVisibilityAction } from '@/app/review/actions';

export function ReviewVisibilityForm({
  productId,
  isPublic,
  intendedActive,
  visibilityNotes,
}: {
  productId: string;
  isPublic: boolean;
  intendedActive: boolean;
  visibilityNotes?: string;
}) {
  return (
    <form action={toggleVisibilityAction} style={{ display: 'grid', gap: 12 }}>
      <input type="hidden" name="productId" value={productId} />
      <label style={fieldStyle}>
        <span>Public intent</span>
        <select name="isPublic" defaultValue={String(isPublic)} style={inputStyle}>
          <option value="false">Not public</option>
          <option value="true">Public intent enabled</option>
        </select>
      </label>
      <label style={fieldStyle}>
        <span>Intended active state</span>
        <select name="intendedActive" defaultValue={String(intendedActive)} style={inputStyle}>
          <option value="false">Inactive</option>
          <option value="true">Intended active</option>
        </select>
      </label>
      <label style={fieldStyle}>
        <span>Visibility notes</span>
        <textarea name="visibilityNotes" defaultValue={visibilityNotes ?? ''} rows={3} style={textareaStyle} />
      </label>
      <button type="submit" style={buttonStyle}>Save visibility</button>
    </form>
  );
}

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  fontSize: 13,
  color: 'rgba(0,0,0,0.72)',
};

const inputStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
  resize: 'vertical',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 999,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#111111',
  color: '#ffffff',
};
