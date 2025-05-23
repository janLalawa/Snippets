using Microsoft.Xrm.Sdk.Query;

namespace NAMESPACEHERE.Mapping.Constants {
  public static class Table1 {
    public
    const string TableName = "name_table";

    public static class Fields {
      public
      const string Id = "name_logical";

      public static class ColumnSets {
        public static readonly ColumnSet MinimalColumnSet = new ColumnSet(Fields.Id, Fields.Name);
      }

      public static class Options {
        public enum ResponseAction {
          None = 0, Create = 799260000, Update = 799260001, CreateAndUpdate = 799260002
        }
      }
    }
  }

  public static class Table2 {
    public
    const string TableName = "name_another";

    public static class Fields {
      public
      const string Id = "name_thing1";
      public
      const string SurveyLookup = "name_thing2";
    }

    public static class ColumnSets {
      public static readonly ColumnSet MinimalColumnSet = new ColumnSet(Fields.Id, Fields.SurveyLookup);
    }

    public static class Options {
      public enum State {
        Active = 0, Inactive = 1
      }

      public enum Type {
        None = 0,
          String = 799260000,
          WholeNumber = 799260001,
          Decimal = 799260002,
          OptionSet = 799260003,
          Currency = 799260004,
          DateTime = 799260005,
          MultiSelectOptionSet = 799260006,
          Matrix = 799260007,
          Lookup = 799260008
      }
    }
  }
}
