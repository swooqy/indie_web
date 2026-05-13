package art.wikkd.chat.repository;

import art.wikkd.chat.entity.Message;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

	@EntityGraph(attributePaths = "sender")
	List<Message> findAllByOrderByIdDesc(Pageable pageable);

	@EntityGraph(attributePaths = "sender")
	List<Message> findByIdLessThanOrderByIdDesc(Long beforeId, Pageable pageable);
}
