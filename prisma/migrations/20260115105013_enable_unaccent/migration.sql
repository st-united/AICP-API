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
  normalized_kw text;
BEGIN
  SELECT string_agg(format('%I', c), ', ')
  INTO cols_sql
  FROM unnest(cols) AS c;

  normalized_kw := lower(coalesce(kw, ''));

  IF normalized_kw = unaccent_immutable(normalized_kw) THEN
    RETURN QUERY EXECUTE format(
      'SELECT %s FROM %s WHERE unaccent_immutable(lower(%I)) LIKE %L',
      cols_sql,
      tbl,
      col,
      '%' || normalized_kw || '%'
    );
  ELSE
    RETURN QUERY EXECUTE format(
      'SELECT %s FROM %s WHERE lower(%I) LIKE %L',
      cols_sql,
      tbl,
      col,
      '%' || normalized_kw || '%'
    );
  END IF;
END;
$$;