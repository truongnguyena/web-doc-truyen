class User < ApplicationRecord
  has_secure_password
  
  has_many :reading_histories
  has_many :bookmarks
  has_many :comments
  has_many :ratings
  
  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true
  validates :password, length: { minimum: 6 }, if: -> { new_record? || !password.nil? }
  
  def generate_jwt
    JWT.encode({
      id: id,
      username: username,
      exp: 24.hours.from_now.to_i
    }, Rails.application.secrets.secret_key_base)
  end
end

class ReadingHistory < ApplicationRecord
  belongs_to :user
  belongs_to :manga
  belongs_to :chapter
  
  validates :user_id, presence: true
  validates :manga_id, presence: true
  validates :chapter_id, presence: true
end

class Bookmark < ApplicationRecord
  belongs_to :user
  belongs_to :manga
  
  validates :user_id, presence: true
  validates :manga_id, presence: true
end

class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :manga
  
  validates :content, presence: true
  validates :user_id, presence: true
  validates :manga_id, presence: true
end

class Rating < ApplicationRecord
  belongs_to :user
  belongs_to :manga
  
  validates :score, presence: true, inclusion: { in: 1..5 }
  validates :user_id, presence: true
  validates :manga_id, presence: true
end
