CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.unaccent_immutable(text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT unaccent('public.unaccent', $1);
$$;

CREATE OR REPLACE FUNCTION public.search_unaccent(tbl regclass, col text, kw text, cols text[])
RETURNS SETOF record
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  cols_sql text;
BEGIN
  SELECT string_agg(format('%I', c), ', ')
  INTO cols_sql
  FROM unnest(cols) AS c;

  RETURN QUERY EXECUTE format(
    'SELECT %s FROM %s WHERE unaccent_immutable(lower(%I)) LIKE %L',
    cols_sql,
    tbl,
    col,
    '%' || lower(coalesce(kw, '')) || '%'
  );
END;
$$;
